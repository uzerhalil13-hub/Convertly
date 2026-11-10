import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { STRINGS } from '../constants/strings';
import { ConversionResult } from '../types';
import { formatFileSize } from '../utils/formatFileSize'; 

interface Props {
  result: ConversionResult;
  saving: boolean;
  sharing: boolean;
  onSave: () => void;
  onShare: () => void;
  onConvertAnother: () => void;
}

export default function ResultCard({
  result,
  saving,
  sharing,
  onSave,
  onShare,
  onConvertAnother,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.successBadge}>
          <Ionicons name="checkmark" size={16} color="#0A0A0F" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{STRINGS.success}</Text>
          <Text style={styles.subtitle}>{STRINGS.resultSubtitle}</Text>
        </View>
      </View>

      <View style={styles.fileBox}>
        <Ionicons name="document-text-outline" size={18} color={COLORS.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.fileName} numberOfLines={1}>
            {result.outputName}
          </Text>
          {}
          {result.size !== undefined && result.size > 0 && (
            <Text style={styles.fileSize}>{formatFileSize(result.size)}</Text>
          )}
        </View>
        <View style={styles.formatPill}>
          <Text style={styles.formatPillText}>{result.format}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={onSave}
          disabled={saving || sharing}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.saveBtn,
            pressed && styles.saveBtnPressed,
            (saving || sharing) && styles.actionBtnDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>{STRINGS.save}</Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={onShare}
          disabled={saving || sharing}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.shareBtn,
            pressed && styles.shareBtnPressed,
            (saving || sharing) && styles.actionBtnDisabled,
          ]}
        >
          {sharing ? (
            <ActivityIndicator color={COLORS.accent} size="small" />
          ) : (
            <>
              <Ionicons name="share-outline" size={18} color={COLORS.accent} />
              <Text style={styles.shareBtnText}>{STRINGS.share}</Text>
            </>
          )}
        </Pressable>
      </View>

      <Pressable onPress={onConvertAnother} style={styles.anotherBtn} hitSlop={8}>
        <Text style={styles.anotherBtnText}>{STRINGS.convertAgain}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginTop: 20,
    padding: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.success + '66',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  successBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  subtitle: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  fileName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  fileSize: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 }, 
  formatPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.accentGlow,
    borderRadius: 6,
  },
  formatPillText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnDisabled: { opacity: 0.6 },
  saveBtn: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnPressed: {
    backgroundColor: COLORS.accentPressed,
    transform: [{ scale: 0.98 }],
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  shareBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  shareBtnPressed: {
    backgroundColor: COLORS.accentGlow,
    transform: [{ scale: 0.98 }],
  },
  shareBtnText: { color: COLORS.accent, fontSize: 15, fontWeight: '700' },
  anotherBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  anotherBtnText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
});