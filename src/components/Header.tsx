import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { STRINGS } from '../constants/strings';

export default function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{STRINGS.appName}</Text>
      <Text style={styles.tagline}>{STRINGS.tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: COLORS.textSecondary, marginTop: 6 },
});