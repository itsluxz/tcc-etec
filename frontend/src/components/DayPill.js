import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

export default function DayPill({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: colors.card,
  },
  pillSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textInverse,
  },
});
