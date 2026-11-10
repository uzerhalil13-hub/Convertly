import { useReducer, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Alert, View, Dimensions, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import { COLORS } from '../constants/colors';
import { STRINGS } from '../constants/strings';
import { getOutputFormats } from '../constants/formats';
import { Format } from '../types';
import { appReducer, initialState } from '../utils/appReducer';
import { ConversionCancelledError } from '../utils/errors';
import { useFilePicker } from '../hooks/useFilePicker';
import { useConversion, getVideoDuration } from '../hooks/useConversion';
import { useShareResult } from '../hooks/useShareResult';
import { useSaveResult } from '../hooks/useSaveResult';
import Header from '../components/Header';
import FilePicker from '../components/FilePicker';
import FileInfoCard from '../components/FileInfoCard';
import FormatSelectorsRow from '../components/FormatSelectorsRow';
import FormatDropdown, { DropdownPosition } from '../components/FormatDropdown';
import ConvertButton from '../components/ConvertButton';
import ResultCard from '../components/ResultCard';
import GifTrimmerModal from '../components/GifTrimmerModal';

export default function HomeScreen() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { pickFile } = useFilePicker();
  const { convert, cancel } = useConversion();
  const { share, sharing } = useShareResult();
  const { save, saving } = useSaveResult();
  const selectorsRowRef = useRef<View>(null);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition | null>(null);

  const [isGifModalVisible, setIsGifModalVisible] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  const handlePick = async () => {
    try {
      if (state.result?.uri) {
        try {
          const safeUri = state.result.uri.startsWith('file://') ? state.result.uri : `file://${state.result.uri}`;
          new File(safeUri).delete();
        } catch {}
      }

      const res = await pickFile();
      if (!res) return;
      if (res.error) {
        Alert.alert('Error', res.error);
        return;
      }
      if (res.file && res.mediaType !== 'unsupported' && res.inputFormat) {
        dispatch({
          type: 'SET_FILE',
          payload: {
            file: res.file,
            mediaType: res.mediaType,
            inputFormat: res.inputFormat,
          },
        });
      }
    } catch {
      Alert.alert('Error', STRINGS.conversionFailed);
    }
  };

  const handleOutputPress = () => {
    if (!state.file || !state.mediaType || !state.inputFormat) {
      Alert.alert('Error', STRINGS.noFileSelected);
      return;
    }

    if (state.isDropdownOpen) {
      dispatch({ type: 'CLOSE_DROPDOWN' });
      return;
    }

    const outputs = getOutputFormats(state.mediaType, state.inputFormat);

    if (outputs.length === 0 && state.mediaType !== 'video') {
      if (state.inputFormat === 'GIF') {
        Alert.alert('Error', STRINGS.gifNotSupported);
      } else if (state.inputFormat === 'MP3') {
        Alert.alert('Error', STRINGS.mp3Already);
      } else {
        Alert.alert('Error', STRINGS.noOutputAvailable);
      }
      return;
    }

    requestAnimationFrame(() => {
      selectorsRowRef.current?.measureInWindow((_x, y, _w, h) => {
        const screenWidth = Dimensions.get('window').width;
        setDropdownPos({ top: y + h + 8, left: 24, width: screenWidth - 48 });
        dispatch({ type: 'OPEN_DROPDOWN' });
      });
    });
  };

  const handleSelectFormat = (format: Format) => {
    dispatch({ type: 'SET_OUTPUT_FORMAT', payload: format });
  };

  const handleCloseDropdown = () => {
    dispatch({ type: 'CLOSE_DROPDOWN' });
  };

  const handleConvert = async () => {
    if (!state.file || !state.mediaType) return;

    
    let finalFormat = state.outputFormat;
    if (!finalFormat && state.isMuted && state.mediaType === 'video') {
      finalFormat = state.inputFormat;
    }

    if (!finalFormat) {
      Alert.alert('Error', STRINGS.noOutputSelected);
      return;
    }

    if (finalFormat === 'GIF' && state.mediaType === 'video') {
      try {
        const duration = await getVideoDuration(state.file.uri);
        setVideoDuration(duration);
        setIsGifModalVisible(true);
      } catch {
        Alert.alert('Error', 'Could not read video duration.');
      }
      return;
    }

    startActualConversion(0, 0, finalFormat);
  };

  const startActualConversion = async (startTime: number, endTime: number, formatOverride?: Format) => {
    if (!state.file || !state.mediaType) return;
    const actualFormat = formatOverride || state.outputFormat;
    if (!actualFormat) return;

    dispatch({ type: 'START_CONVERSION' });

    try {
      const result = await convert({
        file: state.file,
        mediaType: state.mediaType,
        outputFormat: actualFormat,
        startTime,
        endTime,
        mute: state.isMuted,
      });
      dispatch({ type: 'CONVERSION_SUCCESS', payload: result });
    } catch (e) {
      if (e instanceof ConversionCancelledError) {
        dispatch({ type: 'CONVERSION_CANCELLED' });
        Alert.alert(STRINGS.cancel, STRINGS.conversionCancelled);
        return;
      }
      const message = e instanceof Error ? e.message : STRINGS.conversionFailed;
      dispatch({ type: 'CONVERSION_ERROR', payload: message });
      Alert.alert('Conversion failed', message);
    }
  };

  const handleCancel = () => cancel();
  const handleSave = () => { if (state.result) save(state.result); };
  const handleShare = () => { if (state.result) share(state.result); };

  const handleConvertAnother = () => {
    if (state.result?.uri) {
      try {
        const safeUri = state.result.uri.startsWith('file://') ? state.result.uri : `file://${state.result.uri}`;
        new File(safeUri).delete();
      } catch {}
    }
    dispatch({ type: 'CLEAR_FILE' });
  };

  
  const canConvert =
    !!state.file &&
    state.mediaType !== 'unsupported' &&
    (!!state.outputFormat || (state.isMuted && state.mediaType === 'video'));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Header />
        {state.file ? (
          <>
            <FileInfoCard
              file={state.file}
              mediaTypeLabel={state.mediaType ?? ''}
              inputFormatLabel={state.inputFormat ?? ''}
              onChange={handlePick}
            />
            <View ref={selectorsRowRef} collapsable={false}>
              <FormatSelectorsRow
                inputFormat={state.inputFormat}
                outputFormat={state.outputFormat}
                outputDisabled={!state.inputFormat}
                onOutputPress={handleOutputPress}
              />
            </View>

            {/* ✅ Sadece video seçildiğinde "Remove Audio" kutusu görünür */}
            {state.mediaType === 'video' && (
              <Pressable 
                style={styles.muteToggle} 
                onPress={() => dispatch({ type: 'TOGGLE_MUTE' })}
              >
                <View style={styles.muteLeft}>
                  <Ionicons name="volume-mute-outline" size={20} color={state.isMuted ? COLORS.accent : COLORS.textSecondary} />
                  <Text style={[styles.muteText, state.isMuted && { color: COLORS.accent }]}>
                    Remove Audio (Silent Video)
                  </Text>
                </View>
                <View style={[styles.checkbox, state.isMuted && styles.checkboxChecked]}>
                  {state.isMuted && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
              </Pressable>
            )}

            {canConvert && (
              <ConvertButton
                disabled={!canConvert}
                converting={state.isConverting}
                onConvert={handleConvert}
                onCancel={handleCancel}
              />
            )}
            {state.result && (
              <ResultCard
                result={state.result}
                saving={saving}
                sharing={sharing}
                onSave={handleSave}
                onShare={handleShare}
                onConvertAnother={handleConvertAnother}
              />
            )}
          </>
        ) : (
          <FilePicker onPress={handlePick} />
        )}
      </ScrollView>

      <FormatDropdown
        visible={state.isDropdownOpen}
        mediaType={state.mediaType}
        inputFormat={state.inputFormat}
        position={dropdownPos}
        onSelect={handleSelectFormat}
        onClose={handleCloseDropdown}
      />

      <GifTrimmerModal
        visible={isGifModalVisible}
        videoUri={state.file?.uri ?? ''}
        duration={videoDuration}
        onCancel={() => setIsGifModalVisible(false)}
        onConfirm={(start, end) => {
          setIsGifModalVisible(false);
          startActualConversion(start, end);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },
  muteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  muteLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  muteText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textDisabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
});