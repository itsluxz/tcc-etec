import { StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing } from './global';

export const avatarStyles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
});

export const announcementItemStyles = StyleSheet.create({
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
  content: {
    flex: 1,
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

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
});

export const classCardStyles = StyleSheet.create({
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

export const commentItemStyles = StyleSheet.create({
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

export const dayPillStyles = StyleSheet.create({
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: colors.card,
  },
  pillSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textInverse,
  },
});

export const tabBarColors = {
  border: '#E5EBF3',
  inactive: '#71809B',
  active: '#3264F5',
  activeBackground: '#E8EEFF',
};

export const eloTabBarStyles = StyleSheet.create({
  bar: {
    height: 74,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: tabBarColors.border,
    backgroundColor: '#FFFFFF',
  },
  professorBar: { paddingHorizontal: 8 },
  slot: { flex: 1, alignItems: 'center' },
  pill: {
    width: '90%',
    height: 48,
    marginTop: 9,
    paddingBottom: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  professorPill: { width: 82 },
  activePill: { backgroundColor: tabBarColors.activeBackground },
  label: { color: tabBarColors.inactive, fontSize: 10, lineHeight: 12 },
  activeLabel: { color: tabBarColors.active, fontWeight: '700' },
});

export const statBoxStyles = StyleSheet.create({
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

export const subjectRowStyles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
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

export const tagStyles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  icon: {
    marginRight: 4,
  },
});

export const createAvatarContainerStyle = (size, backgroundColor) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  backgroundColor,
});

export const createAvatarTextStyle = (size, color) => ({
  color,
  fontSize: size * 0.36,
});

export const createAnnouncementDotStyle = (highlighted) => ({
  backgroundColor: highlighted ? colors.primary : colors.border,
});

export const createTagContainerStyle = (backgroundColor) => ({ backgroundColor });
export const createTagLabelStyle = (color) => ({ color });
export const createGradeStyle = (color) => ({ color });

const tabIconDimensions = {
  Início: { width: 18, height: 18 },
  Mural: { width: 16, height: 16 },
  Boletim: { width: 16, height: 16 },
  Merenda: { width: 14, height: 17 },
  Reservas: { width: 17, height: 18 },
  Ajuda: { width: 16, height: 16 },
};

export const createTabIconStyle = (name, active, hasActiveIcon) => ({
  ...tabIconDimensions[name],
  tintColor: active
    ? hasActiveIcon
      ? undefined
      : tabBarColors.active
    : name === 'Reservas'
      ? tabBarColors.inactive
      : undefined,
});
