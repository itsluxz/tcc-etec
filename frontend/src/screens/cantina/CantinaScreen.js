import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';

const ink = '#172441';
const muted = '#71809B';
const blue = '#3264F5';

const days = [
  { name: 'SEG', date: '28' },
  { name: 'TER', date: '29' },
  { name: 'QUA', date: '30' },
  { name: 'QUI', date: '01' },
  { name: 'SEX', date: '02' },
];

const menu = [
  { label: 'PRATO PRINCIPAL', value: 'Arroz, feijão e frango assado', color: blue },
  { label: 'ACOMPANHAMENTO', value: 'Salada de cenoura e pepino', color: '#16A896' },
  { label: 'SOBREMESA', value: 'Laranja fresca', color: '#F2A742' },
];

export default function CantinaScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(0, 46 - insets.top) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={require('../../../assets/elo-home-logo-mark.png')} style={styles.logoMark} />
            <Image source={require('../../../assets/elo-home-logo-eye.png')} style={styles.logoEye} />
            <Text style={styles.logoText}>elo</Text>
          </View>
          <View style={styles.notification}>
            <Image source={require('../../../assets/elo-home-bell.png')} style={styles.bell} />
            <View style={styles.notificationDot} />
          </View>
        </View>

        <Text style={styles.title}>Cardápio</Text>
        <Text style={styles.subtitle}>Merenda desta semana</Text>

        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>28 set — 2 out</Text>
          <Text style={styles.weekArrow}>‹</Text>
        </View>

        <View style={styles.days}>
          {days.map((day, index) => (
            <View key={day.name} style={[styles.day, index === 0 && styles.selectedDay]}>
              <Text style={[styles.dayName, index === 0 && styles.selectedDayText]}>{day.name}</Text>
              <Text style={[styles.dayDate, index === 0 && styles.selectedDayText]}>{day.date}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menuCard}>
          <View style={styles.menuHeading}>
            <View style={styles.mealIconOuter}>
              <View style={styles.mealIconInner}>
                <Image source={require('../../../assets/elo-home-meal.png')} style={styles.mealIcon} />
              </View>
            </View>
            <View style={styles.menuHeadingCopy}>
              <Text style={styles.weekday}>SEGUNDA-FEIRA</Text>
              <Text style={styles.mealTitle}>Almoço de hoje</Text>
              <Text style={styles.mealTime}>11h às 13h30</Text>
            </View>
          </View>

          <View style={styles.menuItems}>
            {menu.map((item, index) => (
              <View key={item.label} style={[styles.menuItem, index < menu.length - 1 && styles.menuDivider]}>
                <View style={[styles.itemDot, { backgroundColor: item.color }]} />
                <View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.allergyCard}>
          <Text style={styles.allergyTitle}>Atenção a alergênicos</Text>
          <View style={styles.allergyTags}>
            <View style={styles.allergyTag}><Text style={styles.allergyTagText}>GLÚTEN</Text></View>
            <View style={styles.allergyTag}><Text style={styles.allergyTagText}>SOJA</Text></View>
          </View>
          <Text style={styles.allergyNote}>Em caso de restrição, fale com a escola.</Text>
        </View>

        <Text style={styles.footnote}>Cardápio ilustrativo, sujeito a ajustes.</Text>
      </ScrollView>
      <EloTabBar active="Merenda" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FC' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  header: { height: 47, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  brand: { height: 28, flexDirection: 'row', alignItems: 'center' },
  logoMark: { width: 22, height: 22, marginTop: 4 },
  logoEye: { position: 'absolute', left: 5, top: 13, width: 13, height: 8 },
  logoText: { marginLeft: 9, color: ink, fontSize: 23, lineHeight: 28, fontWeight: '700' },
  notification: { width: 40, height: 40, marginTop: 7, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  bell: { width: 12, height: 17 },
  notificationDot: { position: 'absolute', top: 6, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF6877' },
  title: { marginTop: 10, color: ink, fontSize: 23, lineHeight: 28, fontWeight: '700' },
  subtitle: { marginTop: 5, color: muted, fontSize: 12, lineHeight: 15 },
  weekHeader: { height: 17, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekTitle: { color: ink, fontSize: 14, lineHeight: 17, fontWeight: '700' },
  weekArrow: { color: muted, fontSize: 25, lineHeight: 27, marginRight: 2 },
  days: { height: 69, marginTop: 13, flexDirection: 'row', gap: 8 },
  day: { flex: 1, height: 69, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 12, backgroundColor: '#FFFFFF' },
  selectedDay: { borderColor: blue, backgroundColor: blue },
  dayName: { color: muted, fontSize: 10, lineHeight: 13, fontWeight: '700' },
  dayDate: { marginTop: 5, color: ink, fontSize: 19, lineHeight: 23, fontWeight: '700' },
  selectedDayText: { color: '#FFFFFF' },
  menuCard: { height: 296, marginTop: 18, padding: 13, borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 18, backgroundColor: '#FFFFFF' },
  menuHeading: { height: 84, flexDirection: 'row', alignItems: 'center', borderRadius: 13, backgroundColor: '#E4F7F3' },
  mealIconOuter: { width: 56, height: 56, marginLeft: 13, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D1F0E9' },
  mealIconInner: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  mealIcon: { width: 14, height: 17 },
  menuHeadingCopy: { marginLeft: 11 },
  weekday: { color: '#16A896', fontSize: 10, lineHeight: 12, fontWeight: '700' },
  mealTitle: { marginTop: 3, color: ink, fontSize: 16, lineHeight: 19, fontWeight: '700' },
  mealTime: { marginTop: 7, color: muted, fontSize: 11, lineHeight: 13 },
  menuItems: { marginTop: 8 },
  menuItem: { height: 54, paddingLeft: 3, flexDirection: 'row', alignItems: 'center' },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: '#E5EBF3' },
  itemDot: { width: 8, height: 8, marginRight: 8, borderRadius: 4, alignSelf: 'flex-start', marginTop: 12 },
  itemLabel: { color: muted, fontSize: 9, lineHeight: 11, fontWeight: '700' },
  itemValue: { marginTop: 6, color: ink, fontSize: 12, lineHeight: 15 },
  allergyCard: { height: 98, marginTop: 15, paddingHorizontal: 16, paddingTop: 12, borderRadius: 14, backgroundColor: '#FFF2DF' },
  allergyTitle: { color: ink, fontSize: 14, lineHeight: 17, fontWeight: '700' },
  allergyTags: { marginTop: 10, flexDirection: 'row', gap: 7 },
  allergyTag: { height: 24, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  allergyTagText: { color: '#D48B2D', fontSize: 10, lineHeight: 12, fontWeight: '700' },
  allergyNote: { marginTop: 8, color: muted, fontSize: 11, lineHeight: 13 },
  footnote: { marginTop: 24, color: muted, fontSize: 10, lineHeight: 13 },
});
