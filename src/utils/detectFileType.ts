import { MediaType, Format } from '../types';
import { EXTENSION_MAP, FORMAT_TO_TYPE } from '../constants/formats';

const MIME_SUBTYPE_MAP: Record<string, Format> = {
  jpeg: 'JPG', jpg: 'JPG', png: 'PNG', webp: 'WEBP', bmp: 'BMP',
  heic: 'HEIC', heif: 'HEIC', gif: 'GIF',
  mpeg: 'MP3', mp3: 'MP3', wav: 'WAV', 'x-wav': 'WAV',
  'x-m4a': 'M4A', m4a: 'M4A', aac: 'AAC', flac: 'FLAC',
  ogg: 'OGG', opus: 'OPUS',
  mp4: 'MP4', quicktime: 'MOV', 'x-matroska': 'MKV',
  'x-msvideo': 'AVI', webm: 'WEBM', '3gpp': '3GP',
};

export function detectFileType(
  name: string,
  mimeType: string | null
): { mediaType: MediaType; format: Format | null } {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const formatFromExt = EXTENSION_MAP[ext];
  if (formatFromExt) {
    return { mediaType: FORMAT_TO_TYPE[formatFromExt], format: formatFromExt };
  }

  if (mimeType) {
    const [main, subRaw] = mimeType.split('/');
    const sub = (subRaw ?? '').split(';')[0].toLowerCase();
    if (main === 'image' || main === 'audio' || main === 'video') {
      const fmt = MIME_SUBTYPE_MAP[sub];
      if (fmt) return { mediaType: FORMAT_TO_TYPE[fmt], format: fmt };
      return { mediaType: main, format: null };
    }
  }

  return { mediaType: 'unsupported', format: null };
}