import {
  Modal,
  Pressable,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { STRINGS } from '../constants/strings';
import { CATEGORY_LABELS, getOutputFormats } from '../constants/formats';
import { MediaType, Format } from '../types';

export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

interface Props {
  visible: boolean;
  mediaType: MediaType | null;
  inputFormat: Format | null;
  position: DropdownPosition | null;
  onSelect: (format: Format) => void;
  onClose: () => void;
}

interface Group {
  label: string;
  formats: Format[];
  disabled?: boolean;
}

export default function FormatDropdown({
  visible,
  mediaType,
  inputFormat,
  position,
  onSelect,
  onClose,
}: Props) {
  if (!visible || !mediaType || !inputFormat || !position) return null;

  const outputs = getOutputFormats(mediaType, inputFormat);
  const groups: Group[] = [];

  if (mediaType === 'video') {
    
    const videoOutputs = outputs.filter((f) => ['MOV', 'MKV', 'AVI', 'WEBM', '3GP', 'MP4'].includes(f));
    const audioOutputs = outputs.filter((f) => ['MP3', 'WAV', 'AAC', 'OGG'].includes(f)); 
    const imageOutputs = outputs.filter((f) => ['JPG', 'PNG', 'GIF'].includes(f));

    if (videoOutputs.length > 0) {
      groups.push({ label: 'VIDEO', formats: videoOutputs });
    }
    if (audioOutputs.length > 0) {
      groups.push({ label: 'AUDIO (EXTRACT)', formats: audioOutputs });
    }
    if (imageOutputs.length > 0) {
      groups.push({ label: 'IMAGE / GIF', formats: imageOutputs });
    }
  } else if (mediaType === 'image') {
    if (inputFormat === 'GIF') {
      const imageOutputs = outputs.filter((f) => ['JPG', 'PNG', 'WEBP', 'BMP', 'TIFF'].includes(f));
      const videoOutputs = outputs.filter((f) => ['MP4', 'MOV', 'WEBM'].includes(f));

      if (imageOutputs.length > 0) {
        groups.push({ label: CATEGORY_LABELS.image, formats: imageOutputs });
      }
      if (videoOutputs.length > 0) {
        groups.push({ label: 'VIDEO', formats: videoOutputs });
      }
    } else {
      groups.push({ label: CATEGORY_LABELS.image, formats: outputs });
    }
  } else if (mediaType === 'audio') {
    groups.push({ label: CATEGORY_LABELS.audio, formats: outputs });
  }

  const isEmpty =
    groups.length === 0 || groups.every((g) => g.formats.length === 0 && !g.disabled);

  const screenHeight = Dimensions.get('window').height;
  const maxH = Math.max(120, Math.min(screenHeight * 0.5, screenHeight - position.top - 40));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.panel,
            { top: position.top, left: position.left, width: position.width, maxHeight: maxH },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {isEmpty ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>{STRINGS.noOutputAvailable}</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.scrollContent}
            >
              {groups.map((group, gi) => (
                <View key={group.label} style={gi > 0 ? styles.groupSpacing : undefined}>
                  <Text style={styles.categoryLabel}>{group.label}</Text>
                  {group.disabled ? (
                    <View style={styles.disabledRow}>
                      <Text style={styles.disabledText}>{STRINGS.comingSoon}</Text>
                    </View>
                  ) : (
                    group.formats.map((fmt) => (
                      <Pressable
                        key={fmt}
                        onPress={() => onSelect(fmt)}
                        style={({ pressed }) => [
                          styles.formatRow,
                          pressed && styles.formatRowPressed,
                        ]}
                      >
                        <Text style={styles.formatText}>{fmt}</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={COLORS.textDisabled}
                        />
                      </Pressable>
                    ))
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: COLORS.overlay },
  panel: {
    position: 'absolute',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  scrollContent: { paddingVertical: 8 },
  categoryLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  formatRowPressed: { backgroundColor: COLORS.accentGlow },
  formatText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  groupSpacing: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  disabledRow: { paddingHorizontal: 16, paddingVertical: 14, opacity: 0.5 },
  disabledText: {
    color: COLORS.textDisabled,
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyBox: {
    padding: 20,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
});