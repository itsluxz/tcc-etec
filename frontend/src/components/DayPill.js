import { Pressable, Text } from 'react-native';
import { dayPillStyles } from '../styles/components';

export default function DayPill({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[dayPillStyles.pill, selected && dayPillStyles.pillSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[dayPillStyles.label, selected && dayPillStyles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}
