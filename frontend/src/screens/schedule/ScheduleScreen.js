import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DayPill from '../../components/DayPill';
import ClassCard from '../../components/ClassCard';
import { colors, radius, spacing } from '../../theme/colors';
import { schedule, weekDays } from '../../data/mockData';

// Maps each weekday key to the date label shown under the title.
// In a real integration this would come from the current week's dates.
const dateLabels = {
  Seg: 'Segunda-feira, 22 de junho',
  Ter: 'Terça-feira, 22 de junho',
  Qua: 'Quarta-feira, 22 de junho',
  Qui: 'Quinta-feira, 23 de junho',
  Sex: 'Sexta-feira, 24 de junho',
};

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState('Qui');
  const classes = schedule[selectedDay] ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Horário</Text>
        <Text style={styles.subtitle}>{dateLabels[selectedDay]}</Text>

        <View style={styles.dayRow}>
          {weekDays.map((day) => (
            <DayPill
              key={day.key}
              label={day.label}
              selected={selectedDay === day.key}
              onPress={() => setSelectedDay(day.key)}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {classes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma aula cadastrada para este dia.</Text>
        ) : (
          classes.map((item) =>
            item.isBreak ? (
              <View key={item.id} style={styles.breakRow}>
                <Text style={styles.breakTime}>{item.time}</Text>
                <View style={styles.breakPill}>
                  <Ionicons name="restaurant-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.breakLabel}> {item.label}</Text>
                </View>
              </View>
            ) : (
              <ClassCard
                key={item.id}
                time={item.time}
                subject={item.subject}
                teacher={item.teacher}
                location={item.location}
                color={item.color}
              />
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
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
  dayRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  breakTime: {
    width: 52,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  breakPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  breakLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});
