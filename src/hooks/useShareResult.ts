import { useCallback, useState } from 'react';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { STRINGS } from '../constants/strings';
import { ConversionResult } from '../types';
import { getMimeType } from '../utils/mimeType';

export function useShareResult() {
  const [sharing, setSharing] = useState(false);

  const share = useCallback(async (result: ConversionResult) => {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Error', STRINGS.shareNotAvailable);
        return;
      }

      setSharing(true);
      await Sharing.shareAsync(result.uri, {
        mimeType: getMimeType(result.format),
        dialogTitle: result.outputName,
        UTI: undefined,
      });
    } catch {
      Alert.alert('Error', STRINGS.shareError);
    } finally {
      setSharing(false);
    }
  }, []);

  return { share, sharing };
}