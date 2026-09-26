import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import Tag from './Tag';
import { colors, spacing } from '../theme/colors';

const accentMap = {
  primary: colors.primary,
  info: colors.info,
  warning: colors.warning,
  success: colors.success,
  danger: colors.danger,
};

export default function ClassCard({ time, subject, teacher, location, color = 'primary' }) {
  const accent = accentMap[color] ?? colors.primary;

  return (
    <View style={styles.row}>
      <Text style={styles.time}>{time}</Text>
      <Card style={[styles.card, { borderLeftColor: accent }]}>
        <Text style={styles.subject}>{subject}</Text>
        <Text style={styles.teacher}>{teacher}</Text>
        <Tag label={location} icon="location-sharp" background={colors.tagPink} textColor={colors.tagPinkText} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  time: {
    width: 52,
    paddingTop: spacing.sm,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  card: {
    flex: 1,
    borderLeftWidth: 4,
    gap: 6,
  },
  subject: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  teacher: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
