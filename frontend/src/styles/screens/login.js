import { StyleSheet } from 'react-native';

export const loginColors = {
  blue: '#3264F5',
  ink: '#172441',
  muted: '#71809B',
  statusBar: '#173A9B',
  placeholder: '#AAB5C8',
};

const { blue, ink, muted, statusBar } = loginColors;

export const loginStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: statusBar },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, backgroundColor: '#FFFFFF' },
  header: { height: 301, overflow: 'hidden', backgroundColor: statusBar },
  gradient: { position: 'absolute', top: -24, left: 0, width: '100%', height: 350 },
  circleRight: { position: 'absolute', top: -86, right: -63, width: 236, height: 236 },
  circleLeft: { position: 'absolute', top: 221, left: -47, width: 180, height: 180 },
  curve: { position: 'absolute', top: 79, left: -30, width: 427, height: 198 },
  brand: { flexDirection: 'row', alignItems: 'center', marginTop: 35, marginLeft: 27 },
  logoMark: { width: 22, height: 22 },
  logoDetail: { position: 'absolute', left: 6, top: 8, width: 13, height: 8 },
  logoText: { marginLeft: 9, color: '#FFFFFF', fontSize: 23, fontWeight: '700' },
  headline: {
    marginTop: 42,
    marginLeft: 28,
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '700',
  },
  headerSubtitle: { marginTop: 10, marginLeft: 28, color: '#DFE8FF', fontSize: 14, lineHeight: 22 },
  panel: {
    flexGrow: 1,
    marginTop: -1,
    paddingTop: 20,
    paddingHorizontal: 26,
    paddingBottom: 34,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#FFFFFF',
  },
  title: { color: ink, fontSize: 22, fontWeight: '700', lineHeight: 27 },
  subtitle: { marginTop: 4, marginBottom: 26, color: muted, fontSize: 12, lineHeight: 15 },
  label: { marginBottom: 8, color: ink, fontSize: 11, fontWeight: '700' },
  input: {
    height: 49,
    marginBottom: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E4EBF5',
    borderRadius: 11,
    color: ink,
    fontSize: 13,
  },
  forgot: { alignSelf: 'flex-end', marginTop: -9, color: blue, fontSize: 11, fontWeight: '700' },
  error: { marginTop: 16, marginBottom: -7, color: '#D92D20', fontSize: 12, fontWeight: '700' },
  loginButton: { marginTop: 23 },
  help: { marginTop: 24, color: muted, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
