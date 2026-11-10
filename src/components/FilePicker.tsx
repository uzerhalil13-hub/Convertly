import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { STRINGS } from '../constants/strings';

interface Props {
  onPress: () => void;
}

export default function FilePicker({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.box, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="add" size={28} color={COLORS.accent} />
      </View>
      <Text style={styles.title}>{STRINGS.pickFile}</Text>
      <Text style={styles.hint}>{STRINGS.pickFileHint}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    marginHorizontal: 24,
    paddingVertical: 44,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { borderColor: COLORS.accent, backgroundColor: COLORS.surfaceElevated },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.accentGlow,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
  hint: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});