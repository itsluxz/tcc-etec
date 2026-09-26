import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/colors';

export default function AnnouncementItem({ title, description, highlighted }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: highlighted ? colors.primary : colors.border }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
