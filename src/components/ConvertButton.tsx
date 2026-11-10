import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { STRINGS } from '../constants/strings';

interface Props {
  disabled: boolean;
  converting: boolean;
  onConvert: () => void;
  onCancel: () => void;
}

export default function ConvertButton({ disabled, converting, onConvert, onCancel }: Props) {
  if (converting) {
    return (
      <Pressable
        onPress={onCancel}
        style={({ pressed }) => [
          styles.button,
          styles.cancelButton,
          pressed && styles.cancelButtonPressed,
        ]}
      >
        <View style={styles.row}>
          <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
          <Text style={[styles.text, styles.cancelText]}>{STRINGS.cancel}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onConvert}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        styles.convertButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{STRINGS.convert}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convertButton: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.error,
  },
  cancelButtonPressed: {
    backgroundColor: COLORS.error + '22',
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: COLORS.surfaceElevated,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    backgroundColor: COLORS.accentPressed,
    transform: [{ scale: 0.98 }],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  cancelText: { color: COLORS.error },
});