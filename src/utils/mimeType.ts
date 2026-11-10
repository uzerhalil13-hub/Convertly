import { Format } from '../types';

const FORMAT_TO_MIME: Record<Format, string> = {
  JPG: 'image/jpeg',
  PNG: 'image/png',
  WEBP: 'image/webp',
  BMP: 'image/bmp',
  HEIC: 'image/heic',
  GIF: 'image/gif',
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  M4A: 'audio/mp4',
  AAC: 'audio/aac',
  FLAC: 'audio/flac',
  OGG: 'audio/ogg',
  OPUS: 'audio/opus',
  MP4: 'video/mp4',
  MOV: 'video/quicktime',
  MKV: 'video/x-matroska',
  AVI: 'video/x-msvideo',
  WEBM: 'video/webm',
  '3GP': 'video/3gpp',
};

export function getMimeType(format: Format): string {
  return FORMAT_TO_MIME[format] ?? 'application/octet-stream';
}