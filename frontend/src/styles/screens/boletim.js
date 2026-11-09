import { StyleSheet } from 'react-native';
import { commonScreenStyles } from '../common';

const ink = '#172441';
const muted = '#71809B';
const border = '#E5EBF3';
const card = '#FFFFFF';
const surface = '#F5F7FC';
export const boletimColors = { muted };

export const boletimStyles = {
  ...commonScreenStyles,
  ...StyleSheet.create({
    screen: { flex: 1, backgroundColor: surface },
    content: { paddingHorizontal: 20, paddingBottom: 28 },
    searchWrap: {
      height: 42,
      marginTop: 18,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: border,
      borderRadius: 11,
      backgroundColor: card,
    },
    searchIcon: { color: muted, fontSize: 18 },
    searchInput: { flex: 1, marginLeft: 9, color: ink, fontSize: 12 },
    stateCard: {
      marginTop: 18,
      padding: 22,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: card,
      alignItems: 'center',
    },
    errorCard: { borderColor: '#F9CBCB', backgroundColor: '#FFF7F7' },
    errorTitle: { color: ink, fontSize: 16, lineHeight: 20, fontWeight: '700' },
    stateText: { marginTop: 8, color: muted, fontSize: 12, lineHeight: 17, textAlign: 'center' },
  }),
};
