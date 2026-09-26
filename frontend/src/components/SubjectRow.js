import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import { colors, spacing } from '../theme/colors';

function gradeColor(grade) {
  if (grade >= 8) return colors.success;
  if (grade >= 6) return colors.warning;
  return colors.danger;
}

export default function SubjectRow({ name, grade, absences, frequency }) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            Faltas: {absences} · Frequência {frequency}%
          </Text>
        </View>
        <Text style={[styles.grade, { color: gradeColor(grade) }]}>{grade.toFixed(1).replace('.', ',')}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  grade: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
});
