import { View, StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme/colors';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
});
