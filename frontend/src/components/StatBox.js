import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme/colors';

// `highlighted` renders the solid-purple version (e.g. "Média geral"),
// otherwise it renders as a plain white card (e.g. "Frequência").
export default function StatBox({ label, value, highlighted }) {
  return (
    <View
      style={[
        styles.box,
        highlighted ? styles.highlighted : styles.plain,
      ]}
    >
      <Text style={[styles.label, highlighted && styles.labelHighlighted]}>{label}</Text>
      <Text style={[styles.value, highlighted && styles.valueHighlighted]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  plain: {
    backgroundColor: colors.card,
    ...shadow.card,
  },
  highlighted: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  labelHighlighted: {
    color: colors.primaryLight,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  valueHighlighted: {
    color: colors.textInverse,
  },
});
