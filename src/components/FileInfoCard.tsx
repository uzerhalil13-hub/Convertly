import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { PickedFile } from '../types';
import { formatFileSize } from '../utils/formatFileSize';

interface Props {
  file: PickedFile;
  mediaTypeLabel: string;
  inputFormatLabel: string;
  onChange: () => void;
}

export default function FileInfoCard({ file, mediaTypeLabel, inputFormatLabel, onChange }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="document-outline" size={22} color={COLORS.accent} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{file.name}</Text>
        <Text style={styles.meta}>
          {mediaTypeLabel} · {inputFormatLabel} · {formatFileSize(file.size)}
        </Text>
      </View>
      <Pressable onPress={onChange} style={styles.changeBtn} hitSlop={8}>
        <Ionicons name="swap-horizontal" size={20} color={COLORS.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 24, marginTop: 8,
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  iconBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: COLORS.accentGlow,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  info: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  meta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 3 },
  changeBtn: { padding: 8 },
});