import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { STRINGS } from '../constants/strings';

interface Props {
  format: string | null;
  disabled?: boolean;
  onPress: () => void;
}

export default function OutputFormatBox({ format, disabled, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.box,
        format ? styles.filled : styles.empty,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{STRINGS.outputLabel}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, !format && styles.placeholder]} numberOfLines={1}>
          {format ?? STRINGS.selectOutput}
        </Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.hint}>{format ? 'Tap to change' : 'Tap to choose'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, borderWidth: 1 },
  empty: { borderColor: COLORS.border },
  filled: { borderColor: COLORS.accent, backgroundColor: COLORS.surfaceElevated },
  disabled: { opacity: 0.4 },
  pressed: { backgroundColor: COLORS.surfaceElevated },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  valueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  value: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  placeholder: { color: COLORS.textDisabled, fontSize: 13, fontWeight: '500' },
  hint: { color: COLORS.textDisabled, fontSize: 11, marginTop: 4 },
});