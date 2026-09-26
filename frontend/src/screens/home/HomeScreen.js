import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import AnnouncementItem from '../../components/AnnouncementItem';
import { colors, radius, spacing, shadow } from '../../theme/colors';
import { student, home } from '../../data/mockData';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{student.todayLabel}</Text>
            <Text style={styles.greeting}>Olá, {student.name} 👋</Text>
          </View>
          <Avatar initials={student.initials} />
        </View>

        <View style={styles.schoolCard}>
          <Text style={styles.schoolTag}>{student.school}</Text>
          <Text style={styles.course}>{student.course}</Text>
          <Text style={styles.moduleInfo}>{student.moduleInfo}</Text>
        </View>

        <View style={styles.infoRow}>
          <Card style={styles.infoCard}>
            <Text style={styles.infoIcon}>🍽️</Text>
            <Text style={styles.infoLabel}>Almoço hoje</Text>
            <Text style={styles.infoValue}>{home.lunchToday}</Text>
          </Card>
          <Card style={styles.infoCard}>
            <Ionicons name="location-sharp" size={20} color={colors.danger} />
            <Text style={styles.infoLabel}>Próxima aula</Text>
            <Text style={styles.infoValue}>{home.nextClass}</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Avisos</Text>
          <Pressable>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </Pressable>
        </View>

        <Card>
          {home.announcements.map((item, index) => (
            <View
              key={item.id}
              style={index < home.announcements.length - 1 ? styles.divider : null}
            >
              <AnnouncementItem
                title={item.title}
                description={item.description}
                highlighted={item.highlighted}
              />
            </View>
          ))}
        </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  schoolCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  schoolTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  course: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textInverse,
    marginBottom: 4,
  },
  moduleInfo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flex: 1,
  },
  infoIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
