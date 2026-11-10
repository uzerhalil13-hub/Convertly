import { View, StyleSheet } from 'react-native';
import InputFormatBox from './InputFormatBox';
import OutputFormatBox from './OutputFormatBox';

interface Props {
  inputFormat: string | null;
  outputFormat: string | null;
  outputDisabled: boolean;
  onOutputPress: () => void;
}

export default function FormatSelectorsRow({
  inputFormat,
  outputFormat,
  outputDisabled,
  onOutputPress,
}: Props) {
  return (
    <View style={styles.row}>
      <InputFormatBox format={inputFormat ?? '—'} />
      <View style={styles.gap} />
      <OutputFormatBox
        format={outputFormat}
        disabled={outputDisabled}
        onPress={onOutputPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginHorizontal: 24, marginTop: 16 },
  gap: { width: 12 },
});