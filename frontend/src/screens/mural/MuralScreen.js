import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatBox from '../../components/StatBox';
import SubjectRow from '../../components/SubjectRow';
import CommentItem from '../../components/CommentItem';
import { colors, spacing } from '../../theme/colors';
import { report } from '../../data/mockData';

export default function ReportScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Boletim</Text>
        <Text style={styles.subtitle}>{report.bimesterLabel}</Text>

        <View style={styles.statsRow}>
          <StatBox label="Média geral" value={report.average.toFixed(1).replace('.', ',')} highlighted />
          <StatBox label="Frequência" value={`${report.attendance}%`} />
        </View>

        <Text style={styles.sectionTitle}>Disciplinas</Text>
        {report.subjects.map((subject) => (
          <SubjectRow
            key={subject.id}
            name={subject.name}
            grade={subject.grade}
            absences={subject.absences}
            frequency={subject.frequency}
          />
        ))}

        <Text style={styles.sectionTitle}>Observações dos professores</Text>
        {report.observations.map((observation) => (
          <CommentItem
            key={observation.id}
            teacher={observation.teacher}
            subject={observation.subject}
            initials={observation.initials}
            text={observation.text}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
});
