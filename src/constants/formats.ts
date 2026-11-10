import {
  MediaType,
  Format,
  ImageFormat,
  AudioFormat,
  VideoFormat,
} from '../types';

export const SUPPORTED_INPUTS: {
  image: readonly ImageFormat[];
  audio: readonly AudioFormat[];
  video: readonly VideoFormat[];
} = {
  image: ['JPG', 'PNG', 'WEBP', 'BMP', 'HEIC', 'GIF', 'TIFF'],
  audio: ['MP3', 'WAV', 'M4A', 'AAC', 'FLAC', 'OGG', 'OPUS'],
  video: ['MP4', 'MOV', 'MKV', 'AVI', 'WEBM', '3GP'],
} as const;

export const EXTENSION_MAP: Record<string, Format> = {
  jpg: 'JPG', jpeg: 'JPG', png: 'PNG', webp: 'WEBP', bmp: 'BMP',
  heic: 'HEIC', heif: 'HEIC', gif: 'GIF', tiff: 'TIFF', tif: 'TIFF',
  mp3: 'MP3', wav: 'WAV', m4a: 'M4A', aac: 'AAC',
  flac: 'FLAC', ogg: 'OGG', opus: 'OPUS',
  mp4: 'MP4', mov: 'MOV', mkv: 'MKV', avi: 'AVI', webm: 'WEBM', '3gp': '3GP',
};

export const FORMAT_TO_TYPE: Record<Format, MediaType> = {
  JPG: 'image', PNG: 'image', WEBP: 'image', BMP: 'image',
  HEIC: 'image', GIF: 'image', TIFF: 'image',
  MP3: 'audio', WAV: 'audio', M4A: 'audio', AAC: 'audio',
  FLAC: 'audio', OGG: 'audio', OPUS: 'audio',
  MP4: 'video', MOV: 'video', MKV: 'video', AVI: 'video',
  WEBM: 'video', '3GP': 'video',
};

export const CONVERSIONS: Record<MediaType, Partial<Record<Format, Format[]>>> = {
  image: {
    JPG:  ['PNG', 'WEBP', 'BMP', 'GIF', 'TIFF'],
    PNG:  ['JPG', 'WEBP', 'BMP', 'GIF', 'TIFF'],
    WEBP: ['JPG', 'PNG', 'BMP', 'GIF', 'TIFF'],
    BMP:  ['JPG', 'PNG', 'WEBP', 'GIF', 'TIFF'],
    HEIC: ['JPG', 'PNG', 'WEBP', 'BMP', 'GIF', 'TIFF'],
    GIF:  ['JPG', 'PNG', 'WEBP', 'BMP', 'TIFF', 'MP4', 'MOV', 'WEBM'], 
    TIFF: ['JPG', 'PNG', 'WEBP', 'BMP', 'GIF'],
  },
  audio: {
    MP3:  ['WAV', 'M4A', 'AAC', 'FLAC', 'OGG', 'OPUS'],
    WAV:  ['MP3', 'M4A', 'AAC', 'FLAC', 'OGG', 'OPUS'],
    M4A:  ['MP3', 'WAV', 'AAC', 'FLAC', 'OGG', 'OPUS'],
    AAC:  ['MP3', 'WAV', 'M4A', 'FLAC', 'OGG', 'OPUS'],
    FLAC: ['MP3', 'WAV', 'M4A', 'AAC', 'OGG', 'OPUS'],
    OGG:  ['MP3', 'WAV', 'M4A', 'AAC', 'FLAC', 'OPUS'],
    OPUS: ['MP3', 'WAV', 'M4A', 'AAC', 'FLAC', 'OGG'],
  },
  video: {
    
    MP4:  ['MOV', 'MKV', 'AVI', 'WEBM', '3GP', 'GIF', 'MP3', 'WAV', 'AAC', 'OGG', 'JPG', 'PNG'],
    MOV:  ['MP4', 'MKV', 'AVI', 'WEBM', '3GP', 'GIF', 'MP3', 'WAV', 'AAC', 'OGG', 'JPG', 'PNG'],
    MKV:  ['MP4', 'MOV', 'AVI', 'WEBM', '3GP', 'GIF', 'MP3', 'WAV', 'AAC', 'OGG', 'JPG', 'PNG'],
    AVI:  ['MP4', 'MOV', 'MKV', 'WEBM', '3GP', 'GIF', 'MP3', 'WAV', 'AAC', 'OGG', 'JPG', 'PNG'],
    WEBM: ['MP4', 'MOV', 'MKV', 'AVI', '3GP', 'GIF', 'MP3', 'WAV', 'AAC', 'OGG', 'JPG', 'PNG'],
    '3GP':['MP4', 'MOV', 'MKV', 'AVI', 'WEBM', 'GIF', 'MP3', 'WAV', 'AAC', 'OGG', 'JPG', 'PNG'],
  },
  unsupported: {},
};

export const CATEGORY_LABELS = {
  image: 'IMAGE',
  audio: 'AUDIO',
  video: 'VIDEO',
  'audio-extract': 'AUDIO (EXTRACT)',
  'video-coming-soon': 'VIDEO',
} as const;

export function getOutputFormats(
  mediaType: MediaType,
  inputFormat: Format
): Array<Format> {
  const map = CONVERSIONS[mediaType];
  if (!map) return [];
  return map[inputFormat] ?? [];
}