import { StyleSheet } from 'react-native';
import { commonScreenStyles } from '../common';

const ink = '#172441';
const muted = '#71809B';

export const reservasStyles = {
  ...commonScreenStyles,
  ...StyleSheet.create({
    content: { paddingHorizontal: 20, paddingBottom: 19 },
    hero: { height: 100, marginTop: 19, borderRadius: 17, overflow: 'hidden' },
    heroImage: { position: 'absolute', width: '100%', height: 100 },
    heroTitle: { marginTop: 15, marginLeft: 16, color: '#FFFFFF', fontSize: 17, lineHeight: 21, fontWeight: '700' },
    heroSubtitle: { marginTop: 8, marginLeft: 16, color: '#E7EDFF', fontSize: 11, lineHeight: 13 },
    newReservation: {
      width: 115,
      height: 25,
      marginTop: 11,
      marginLeft: 16,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },
    newReservationText: { color: '#3264F5', fontSize: 10, fontWeight: '700' },
    sectionHeader: {
      height: 21,
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: { color: ink, fontSize: 17, lineHeight: 21, fontWeight: '700' },
    sectionDate: { color: '#3264F5', fontSize: 11, lineHeight: 13, fontWeight: '700' },
    periods: { height: 26, marginTop: 11, flexDirection: 'row', gap: 7 },
    period: {
      height: 26,
      paddingHorizontal: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },
    selectedPeriod: { backgroundColor: '#E8EEFF' },
    periodText: { color: muted, fontSize: 10, fontWeight: '700' },
    selectedPeriodText: { color: '#3264F5' },
    footnote: { marginTop: 28, color: '#AAB5C8', fontSize: 10, lineHeight: 12 },
    unavailable: {
      marginTop: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: '#E5EBF3',
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
    },
    unavailableText: { color: muted, fontSize: 12, lineHeight: 17 },
  }),
};
