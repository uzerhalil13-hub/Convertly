import { useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { PickedFile, MediaType, Format } from '../types';
import { detectFileType } from '../utils/detectFileType';
import { STRINGS } from '../constants/strings';

export interface PickResult {
  file: PickedFile | null;
  mediaType: MediaType;
  inputFormat: Format | null;
  error: string | null;
}

export function useFilePicker() {
  const pickFile = useCallback(async (): Promise<PickResult | null> => {
    const res = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (res.canceled) return null;

    const asset = res.assets[0];
    const file: PickedFile = {
      uri: asset.uri,
      name: asset.name,
      size: asset.size ?? 0,
      mimeType: asset.mimeType ?? null,
    };

    const { mediaType, format } = detectFileType(file.name, file.mimeType);

    if (mediaType === 'unsupported' || !format) {
      return {
        file: null,
        mediaType: 'unsupported',
        inputFormat: null,
        error: STRINGS.unsupportedFile,
      };
    }

    return { file, mediaType, inputFormat: format, error: null };
  }, []);

  return { pickFile };
}