import { StyleSheet } from 'react-native';
import { colors, fontSizes, fontWeights } from './global';

export const commonScreenStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FC' },
  scroll: { flex: 1 },
  header: {
    height: 47,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  brand: { height: 28, flexDirection: 'row', alignItems: 'center' },
  logoMark: { width: 22, height: 22, marginTop: 4 },
  logoEye: { position: 'absolute', left: 5, top: 13, width: 13, height: 8 },
  logoText: {
    marginLeft: 9,
    color: '#172441',
    fontSize: fontSizes.xl,
    lineHeight: 28,
    fontWeight: fontWeights.bold,
  },
  notification: {
    width: 40,
    height: 40,
    marginTop: 7,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  bell: { width: 12, height: 17 },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF6877',
  },
  title: {
    marginTop: 10,
    color: '#172441',
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '700',
  },
  subtitle: { marginTop: 5, color: '#71809B', fontSize: fontSizes.sm, lineHeight: 15 },
});

export const primaryButtonStyles = StyleSheet.create({
  button: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#3264F5',
  },
  disabled: { opacity: 0.6 },
  label: { color: colors.textInverse, fontSize: 13, fontWeight: fontWeights.bold },
});

export const contentTopStyle = (insetsTop) => ({
  paddingTop: Math.max(0, 46 - insetsTop),
});
