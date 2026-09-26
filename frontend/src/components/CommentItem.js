import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import Avatar from './Avatar';
import { colors, spacing } from '../theme/colors';

export default function CommentItem({ teacher, subject, initials, text }) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Avatar initials={initials} size={32} background={colors.primaryLight} textColor={colors.primary} />
        <Text style={styles.name}>
          {teacher} <Text style={styles.subject}>· {subject}</Text>
        </Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    marginLeft: spacing.sm,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subject: {
    fontWeight: '400',
    color: colors.textSecondary,
  },
  text: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
