import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { colors, radius, spacing } from '../../theme/colors';
import { lunch } from '../../data/mockData';

export default function LunchScreen() {
  // null = not answered yet, true = coming, false = not coming.
  const [attending, setAttending] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Almoço</Text>
        <Text style={styles.subtitle}>{lunch.dateLabel}</Text>

        <Card style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>Você vai almoçar hoje?</Text>
          <Text style={styles.confirmSubtitle}>Confirme até as 9h para a cozinha se organizar.</Text>

          <View style={styles.buttonsRow}>
            <Pressable
              style={[styles.button, styles.yesButton, attending === true && styles.yesButtonActive]}
              onPress={() => setAttending(true)}
            >
              <Ionicons
                name="checkmark"
                size={16}
                color={attending === true ? colors.textInverse : colors.success}
              />
              <Text style={[styles.buttonText, { color: attending === true ? colors.textInverse : colors.success }]}>
                {' '}Sim, vou
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.noButton, attending === false && styles.noButtonActive]}
              onPress={() => setAttending(false)}
            >
              <Ionicons
                name="close"
                size={16}
                color={attending === false ? colors.textInverse : colors.danger}
              />
              <Text style={[styles.buttonText, { color: attending === false ? colors.textInverse : colors.danger }]}>
                {' '}Não vou
              </Text>
            </Pressable>
          </View>

          <Text style={styles.helperText}>
            {attending === null
              ? 'Toque para confirmar sua presença.'
              : attending
              ? 'Presença confirmada. Bom apetite! 🍽️'
              : 'Ausência registrada para hoje.'}
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Cardápio do dia</Text>

        <Card>
          {lunch.menu.map((item, index) => (
            <View
              key={item.id}
              style={[styles.menuRow, index < lunch.menu.length - 1 && styles.menuDivider]}
            >
              <View style={styles.menuIconWrap}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label.toUpperCase()}</Text>
                <Text style={styles.menuValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={styles.noteRow}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.noteText}>{lunch.vegetarianNote}</Text>
        </View>
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
  confirmCard: {
    marginBottom: spacing.lg,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  confirmSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  yesButton: {
    borderColor: colors.success,
    backgroundColor: colors.tagGreen,
  },
  yesButtonActive: {
    backgroundColor: colors.success,
  },
  noButton: {
    borderColor: colors.danger,
    backgroundColor: '#FCEAEA',
  },
  noButtonActive: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  menuValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
  },
});
