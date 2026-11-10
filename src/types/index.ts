
export type MediaType = 'image' | 'audio' | 'video' | 'unsupported';


export type ImageFormat = 'JPG' | 'PNG' | 'WEBP' | 'BMP' | 'HEIC' | 'GIF' | 'TIFF';
export type AudioFormat = 'MP3' | 'WAV' | 'M4A' | 'AAC' | 'FLAC' | 'OGG' | 'OPUS';
export type VideoFormat = 'MP4' | 'MOV' | 'MKV' | 'AVI' | 'WEBM' | '3GP';

export type Format = ImageFormat | AudioFormat | VideoFormat;


export interface PickedFile {
  uri: string;
  name: string;
  size: number;       
  mimeType: string | null;
}


export interface ConversionResult {
  uri: string;
  format: Format;
  outputName: string;
  size?: number;
}


export interface AppState {
  file: PickedFile | null;
  mediaType: MediaType | null;
  inputFormat: Format | null;        
  outputFormat: Format | null;       
  isDropdownOpen: boolean;
  isConverting: boolean;
  result: ConversionResult | null;
  error: string | null;
  isMuted: boolean;                  
}


export type AppAction =
  | { type: 'SET_FILE'; payload: { file: PickedFile; mediaType: MediaType; inputFormat: Format } }
  | { type: 'CLEAR_FILE' }
  | { type: 'SET_OUTPUT_FORMAT'; payload: Format }
  | { type: 'OPEN_DROPDOWN' }
  | { type: 'CLOSE_DROPDOWN' }
  | { type: 'START_CONVERSION' }
  | { type: 'CONVERSION_SUCCESS'; payload: ConversionResult }
  | { type: 'CONVERSION_ERROR'; payload: string }
  | { type: 'CONVERSION_CANCELLED' }
  | { type: 'RESET_RESULT' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_MUTE' };         