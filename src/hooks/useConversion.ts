import { useCallback, useRef } from 'react';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { startConversion, Audio2Mp3Error } from 'expo-audio2mp3';
import { execute, cancel as cancelFFmpeg, pickEncoder, getMediaInformation } from 'munim-ffmpeg';
import { Media } from 'react-native-transcoder'; 
import { ConversionResult, Format, MediaType, PickedFile } from '../types';
import { STRINGS } from '../constants/strings';
import { ConversionCancelledError } from '../utils/errors';

interface ConvertParams {
  file: PickedFile;
  mediaType: MediaType;
  outputFormat: Format;
  startTime?: number;
  endTime?: number;
  mute?: boolean; 
}

interface ActiveAudioJob {
  cancel: () => void;
}

export function useConversion() {
  const cancelledRef = useRef(false);
  const activeAudioJobRef = useRef<ActiveAudioJob | null>(null);
  const activeFFmpegSessionRef = useRef<number | undefined>(undefined);
  const activeTranscoderJobRef = useRef<any>(null);

  const convert = useCallback(
    async ({ file, mediaType, outputFormat, startTime = 0, endTime = 0, mute = false }: ConvertParams): Promise<ConversionResult> => {
      cancelledRef.current = false;
      activeAudioJobRef.current = null;
      activeFFmpegSessionRef.current = undefined;
      activeTranscoderJobRef.current = null;

      try {
        if (mediaType === 'image' && ['JPG', 'PNG', 'WEBP', 'BMP'].includes(outputFormat)) {
          return await convertImage(file, outputFormat, cancelledRef);
        }

        if ((mediaType === 'audio' || mediaType === 'video') && outputFormat === 'MP3') {
          return await convertToAudio(file, outputFormat, cancelledRef, activeAudioJobRef);
        }

        if ((mediaType === 'audio' || mediaType === 'video') && outputFormat === 'OGG') {
          return await convertToOggVorbis(file, cancelledRef, activeTranscoderJobRef);
        }

        return await convertWithFFmpeg(file, mediaType, outputFormat, startTime, endTime, mute, cancelledRef, activeFFmpegSessionRef);
      } finally {
        activeAudioJobRef.current = null;
        activeFFmpegSessionRef.current = undefined;
        activeTranscoderJobRef.current = null;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    activeAudioJobRef.current?.cancel();
    if (activeFFmpegSessionRef.current !== undefined) {
      cancelFFmpeg(activeFFmpegSessionRef.current);
    }
    if (activeTranscoderJobRef.current) {
      activeTranscoderJobRef.current.cancel();
    }
  }, []);

  return { convert, cancel };
}

function getSafeBaseName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'converted';
  return baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
}


async function convertImage(
  file: PickedFile,
  outputFormat: Format,
  cancelledRef: React.MutableRefObject<boolean>
): Promise<ConversionResult> {
  let saveFormat: SaveFormat;
  let ext: string;

  switch (outputFormat) {
    case 'JPG': saveFormat = SaveFormat.JPEG; ext = 'jpg'; break;
    case 'PNG': saveFormat = SaveFormat.PNG; ext = 'png'; break;
    case 'WEBP': saveFormat = SaveFormat.WEBP; ext = 'webp'; break;
    default: throw new Error(STRINGS.conversionFailed);
  }

  let result;
  try {
    result = await manipulateAsync(file.uri, [], { compress: 0.9, format: saveFormat });
  } catch {
    throw new Error(STRINGS.conversionFailed);
  }

  if (cancelledRef.current) {
    try { new File(result.uri).delete(); } catch {}
    throw new ConversionCancelledError();
  }

  const baseName = getSafeBaseName(file.name);
  const info = await FileSystem.getInfoAsync(result.uri);
  
  return { 
    uri: result.uri, 
    format: outputFormat, 
    outputName: `${baseName}.${ext}`,
    size: info.exists ? info.size : 0
  };
}


async function convertToAudio(
  file: PickedFile,
  outputFormat: Format,
  cancelledRef: React.MutableRefObject<boolean>,
  activeJobRef: React.MutableRefObject<ActiveAudioJob | null>
): Promise<ConversionResult> {
  const baseName = getSafeBaseName(file.name);
  const outputName = `${baseName}.mp3`;
  const outputFile = new File(Paths.cache, outputName);

  try {
    const job = startConversion({
      input: file.uri,
      output: outputFile.uri,
      bitrate: 192,
      overwrite: true,
    });

    activeJobRef.current = { cancel: () => job.cancel() };

    try {
      const result = await job.promise;

      if (cancelledRef.current) {
        try { new File(result.uri).delete(); } catch {}
        throw new ConversionCancelledError();
      }

      const info = await FileSystem.getInfoAsync(result.uri);

      return { 
        uri: result.uri, 
        format: 'MP3', 
        outputName,
        size: info.exists ? info.size : 0 
      };
    } catch (e) {
      if (e instanceof ConversionCancelledError) throw e;
      if (e instanceof Audio2Mp3Error && e.code === 'CANCELLED') throw new ConversionCancelledError();
      if (cancelledRef.current) throw new ConversionCancelledError();
      throw new Error(mapAudio2Mp3Error(e));
    } finally {
      activeJobRef.current = null;
    }
  } catch (e) {
    if (e instanceof ConversionCancelledError) throw e;
    throw e;
  }
}


async function convertToOggVorbis(
  file: PickedFile,
  cancelledRef: React.MutableRefObject<boolean>,
  activeJobRef: React.MutableRefObject<any>
): Promise<ConversionResult> {
  const baseName = getSafeBaseName(file.name);
  const outputName = `${baseName}.ogg`;
  const outputUri = `${Media.scratchDirectory}/${outputName}`;

  let source: any = null;
  let destination: any = null;
  let job: any = null;
  let progress: any = null;

  try {
    source = await Media.openFileSource({ uri: file.uri });
    destination = await Media.openFileDestination({
      uri: outputUri,
      overwrite: 'replace-atomically',
    });

    job = await Media.createTranscodeJob(source, destination, {
      audio: {
        mode: 'encode',
        codec: 'vorbis',
        container: 'ogg',
        quality: { mode: 'bitrate', bitsPerSecond: 192_000, bitRateMode: 'vbr' },
      },
    });

    activeJobRef.current = job;

    progress = job.addOnProgressListener(() => {
      if (cancelledRef.current) {
        job.cancel();
      }
    });

    const report = await job.run();

    if (cancelledRef.current || report.wasCancelled) {
      throw new ConversionCancelledError();
    }

    const info = await FileSystem.getInfoAsync(report.outputUri);

    return {
      uri: report.outputUri,
      format: 'OGG',
      outputName,
      size: info.exists ? info.size : report.outputByteSize,
    };
  } catch (e: any) {
    if (e?.message?.includes('no audio stream') || e?.message?.includes('probe-failed')) {
      throw new Error(STRINGS.noAudioTrack);
    }
    if (e instanceof ConversionCancelledError) throw e;
    if (cancelledRef.current) throw new ConversionCancelledError();
    throw new Error(STRINGS.conversionFailed);
  } finally {
    if (progress) progress.remove();
    if (job) job.close();
    if (destination) destination.close();
    if (source) source.close();
    activeJobRef.current = null;
  }
}


async function convertWithFFmpeg(
  file: PickedFile,
  mediaType: MediaType,
  outputFormat: Format,
  startTime: number,
  endTime: number,
  mute: boolean,
  cancelledRef: React.MutableRefObject<boolean>,
  sessionIdRef: React.MutableRefObject<number | undefined>
): Promise<ConversionResult> {
  const baseName = getSafeBaseName(file.name);
  const outputName = `${baseName}.${outputFormat.toLowerCase()}`;
  
  const outputFile = new File(Paths.cache, outputName);
  const inputPath = file.uri.replace('file://', '');
  const outputPath = outputFile.uri.replace('file:

  let args: string[] = ['-y', '-i', inputPath];

  if (mediaType === 'image' && ['MP4', 'MOV', 'WEBM'].includes(outputFormat)) {
    if (outputFormat === 'WEBM') {
      const vpEncoder = await pickEncoder(['libvpx', 'libvpx-vp9']) || 'libvpx-vp9';
      args.push(
        '-ignore_loop', '1',
        '-c:v', vpEncoder,
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15',
        '-r', '15',
        '-b:v', '1M',
        '-pix_fmt', 'yuv420p',
        '-an'
      );
    } else {
      const encoder = await pickEncoder(['libx264', 'h264_mediacodec', 'h264_videotoolbox']) || 'libx264';
      const qualityArgs = (encoder === 'libx264') ? ['-preset', 'fast', '-crf', '23'] : ['-b:v', '2M']; 
      args.push(
        '-ignore_loop', '1',
        '-c:v', encoder,
        ...qualityArgs,
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15',
        '-r', '15',
        '-pix_fmt', 'yuv420p',
        '-an'
      );
    }
  }
  else if (outputFormat === 'GIF') {
    const actualEndTime = endTime > startTime ? endTime : startTime + 4;
    const gifDuration = Math.max(0.5, actualEndTime - startTime);
    args.push(
      '-ss', startTime.toString(),
      '-t', gifDuration.toString(),
      '-vf', 'fps=12,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
      '-loop', '0'
    );
  } 
  else if (['JPG', 'PNG', 'TIFF', 'BMP'].includes(outputFormat)) {
    args.push('-frames:v', '1');
  } 
  else if (mediaType === 'video') {
    
    const isFormatSame = file.name.toLowerCase().endsWith(`.${outputFormat.toLowerCase()}`);
    
    if (mute && isFormatSame) {
      
      args.push('-c:v', 'copy', '-an');
    } else {
      
      const encoder = await pickEncoder(['libx264', 'h264_videotoolbox']);
      if (encoder) {
        const quality = encoder === 'libx264' ? ['-preset', 'veryfast', '-crf', '23'] : ['-b:v', '2M'];
        args.push('-c:v', encoder, ...quality, '-pix_fmt', 'yuv420p');
        
        if (mute) {
          args.push('-an'); 
        } else {
          args.push('-c:a', 'aac'); 
        }
      }
    }
  } 
  else if (mediaType === 'audio' || ['WAV', 'AAC', 'FLAC', 'OPUS', 'M4A'].includes(outputFormat)) {
    args.push('-vn');
    switch (outputFormat) {
      case 'AAC':
      case 'M4A': args.push('-c:a', 'aac'); break;
      case 'WAV': args.push('-c:a', 'pcm_s16le'); break;
      case 'FLAC': args.push('-c:a', 'flac'); break;
      case 'OPUS': args.push('-c:a', 'libopus'); break;
      default: throw new Error(STRINGS.conversionFailed);
    }
  } else {
    throw new Error(STRINGS.conversionFailed);
  }

  args.push(outputPath);

  const result = await execute(args, undefined, undefined, (id) => {
    sessionIdRef.current = id;
  });

  if (cancelledRef.current || result.cancelled) {
    try { outputFile.delete(); } catch {}
    throw new ConversionCancelledError();
  }
  
  if (!result.success) {
    throw new Error(result.failStackTrace ?? STRINGS.conversionFailed);
  }

  const info = await FileSystem.getInfoAsync(outputFile.uri);
  if (!info.exists) {
    throw new Error('Conversion failed: Output file was not created.');
  }

  return { 
    uri: outputFile.uri, 
    format: outputFormat, 
    outputName,
    size: info.size
  };
}

export async function getVideoDuration(fileUri: string): Promise<number> {
  try {
    const info = await getMediaInformation(fileUri.replace('file://', ''));
    return info.format?.duration ? parseFloat(info.format.duration) : 0;
  } catch {
    return 0;
  }
}

function mapAudio2Mp3Error(error: unknown): string {
  if (error instanceof Audio2Mp3Error) {
    switch (error.code) {
      case 'NO_AUDIO_TRACK': return STRINGS.noAudioTrack;
      case 'UNSUPPORTED_FORMAT': return STRINGS.unsupportedOnDevice;
      case 'DRM_PROTECTED': return STRINGS.drmProtected;
      case 'INSUFFICIENT_SPACE': return STRINGS.notEnoughSpace;
      case 'CANCELLED': return STRINGS.conversionCancelled;
      case 'FILE_NOT_FOUND': return STRINGS.noFileSelected;
      case 'PERMISSION_DENIED': return 'Permission denied. Please allow file access.';
      default: return STRINGS.conversionFailed;
    }
  }
  return STRINGS.conversionFailed;
}