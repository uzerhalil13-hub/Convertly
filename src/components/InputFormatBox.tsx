import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { STRINGS } from '../constants/strings';

interface Props {
  format: string;
}

export default function InputFormatBox({ format }: Props) {
  return (
    <View style={[styles.box, styles.locked]}>
      <Text style={styles.label}>{STRINGS.inputLabel}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{format}</Text>
        <Ionicons name="lock-closed" size={14} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.hint}>{STRINGS.inputLocked}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  locked: { opacity: 0.9 },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  value: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  hint: { color: COLORS.textDisabled, fontSize: 11, marginTop: 4 },
});