import { useCallback, useState } from 'react';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { STRINGS } from '../constants/strings';
import { ConversionResult } from '../types';
import { FORMAT_TO_TYPE } from '../constants/formats';
import { getMimeType } from '../utils/mimeType';

export function useSaveResult() {
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (result: ConversionResult) => {
    setSaving(true);

    try {
      const mediaType = FORMAT_TO_TYPE[result.format];

      
      if (mediaType === 'image' || mediaType === 'video') {
        const perm = await requestPermissionsAsync();
        if (!perm.granted) {
          throw new Error(STRINGS.savePermissionDenied);
        }
        await Asset.create(result.uri);
        Alert.alert(STRINGS.save, STRINGS.savedToGallery);
      } else {
        
        const saf = FileSystem.StorageAccessFramework;
        if (!saf?.requestDirectoryPermissionsAsync) {
          throw new Error(STRINGS.saveError);
        }

        const permissions = await saf.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          throw new Error(STRINGS.savePermissionDenied);
        }

        
        const safeUri = result.uri.startsWith('file://') ? result.uri : `file://${result.uri}`;

        const info = await FileSystem.getInfoAsync(safeUri);
        if (!info.exists) {
          throw new Error(STRINGS.saveError);
        }

        const base64 = await FileSystem.readAsStringAsync(safeUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (base64.length === 0) {
          throw new Error(STRINGS.saveError);
        }

        const mimeType = getMimeType(result.format);

        const fileUri = saf.createFileAsync
          ? await saf.createFileAsync(permissions.directoryUri, result.outputName, mimeType)
          : permissions.directoryUri + '/' + result.outputName;

        await saf.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert(STRINGS.save, STRINGS.savedToFiles);
      }
    } catch (e: any) {
      console.error('[SAVE] ERROR:', e?.message ?? e);
      
      if (e?.message === STRINGS.savePermissionDenied) {
        Alert.alert('Error', STRINGS.savePermissionDenied);
      } else {
        Alert.alert('Error', STRINGS.saveError);
      }
    } finally {
      setSaving(false);
    }
  }, []);

  return { save, saving };
}