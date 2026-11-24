import { StyleSheet } from 'react-native';
import { commonScreenStyles } from '../common';
import { colors } from '../global';

const ink = '#172441';
const muted = '#71809B';
const border = '#E5EBF3';
const card = '#FFFFFF';
const surface = '#F5F7FC';
export const boletimColors = { muted };

// cor de cada menção, da menor (I) para a maior (MB)
const mencaoColors = {
  I: colors.danger,
  R: colors.warning,
  B: colors.info,
  MB: colors.success,
};

export const createMencaoStyle = (mencao) => {
  const color = mencaoColors[mencao] ?? muted;
  return {
    pill: { backgroundColor: `${color}1A` },
    text: { color },
  };
};

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
    legend: { marginTop: 12, color: muted, fontSize: 11, lineHeight: 15 },
    subjectCard: {
      marginTop: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: card,
    },
    subjectName: { color: ink, fontSize: 14, lineHeight: 18, fontWeight: '700' },
    subjectMeta: { marginTop: 2, color: muted, fontSize: 11, lineHeight: 15 },
    bimestres: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
    bimestre: { flex: 1, alignItems: 'center' },
    bimestreLabel: { color: muted, fontSize: 10, lineHeight: 13 },
    mencaoPill: {
      minWidth: 40,
      marginTop: 5,
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    mencaoText: { fontSize: 13, fontWeight: '700' },
    addButton: { marginTop: 14 },
    formCard: {
      marginTop: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: card,
    },
    formLabel: { marginTop: 12, color: ink, fontSize: 12, lineHeight: 15, fontWeight: '700' },
    options: { marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    option: {
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: surface,
    },
    optionActive: { borderColor: '#3264F5', backgroundColor: '#3264F5' },
    optionText: { color: muted, fontSize: 12, fontWeight: '600' },
    optionTextActive: { color: '#FFFFFF' },
    formHint: { marginTop: 6, color: muted, fontSize: 12, lineHeight: 16 },
    formError: { marginTop: 12, color: colors.danger, fontSize: 12, lineHeight: 16 },
    saveButton: { marginTop: 16 },
    // cartão de nota do professor (NotaCard)
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    cardTitle: { flex: 1 },
    menu: { marginTop: 10, padding: 12, borderRadius: 10, backgroundColor: surface },
    menuRow: { flexDirection: 'row', gap: 20 },
    menuQuestion: { marginBottom: 8, color: ink, fontSize: 12, fontWeight: '600' },
    menuItem: { color: '#3264F5', fontSize: 13, fontWeight: '700' },
    menuItemDanger: { color: colors.danger },
    finalLabel: { color: ink, fontWeight: '700' },
    editButtons: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
    editSaveButton: { flex: 1 },
    editCancel: { color: muted, fontSize: 13, fontWeight: '700' },
    cardPressed: { opacity: 0.7 },
    // modal com as notas completas (NotaModal)
    modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(23, 36, 65, 0.45)' },
    modalDismiss: { flex: 1 },
    modalSheet: {
      maxHeight: '85%',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 28,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      backgroundColor: card,
    },
    modalHeader: { marginBottom: 6, flexDirection: 'row', alignItems: 'flex-start' },
    modalTitle: { color: ink, fontSize: 18, lineHeight: 23, fontWeight: '700' },
    modalSection: { marginTop: 12, padding: 14, borderRadius: 14, backgroundColor: surface },
    modalSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalSectionTitle: { color: ink, fontSize: 14, lineHeight: 18, fontWeight: '700' },
    modalFinal: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    modalRow: {
      marginTop: 8,
      paddingTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: border,
    },
    modalRowLabel: { color: muted, fontSize: 13 },
    modalObservacao: { marginTop: 10, color: ink, fontSize: 12, lineHeight: 17, fontStyle: 'italic' },
    modalActions: { marginTop: 14 },
  }),
};
