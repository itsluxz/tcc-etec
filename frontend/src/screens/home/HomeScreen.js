import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';

const ink = '#172441';
const muted = '#71809B';
const blue = '#3264F5';

const shortcuts = [
  { title: 'Mural', icon: require('../../../assets/elo-home-mural.png'), tint: '#E8EEFF', route: 'Mural' },
  { title: 'Merenda', icon: require('../../../assets/elo-home-meal.png'), tint: '#E4F7F3', route: 'Merenda' },
  { title: 'Reservas', icon: require('../../../assets/elo-reservas-flask-blue.png'), tint: '#E8EEFF', route: 'Reservas' },
  { title: 'Ajuda', icon: require('../../../assets/elo-home-help.png'), tint: '#F1EBFF', route: 'Ajuda' },
];

export default function HomeScreen({ navigation }) {
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

        <Text style={styles.greeting}>Bom dia, Ana!</Text>
        <Text style={styles.date}>Segunda-feira, 28 de setembro</Text>

        <View style={styles.hero}>
          <Image source={require('../../../assets/elo-home-hero.png')} style={styles.heroImage} resizeMode="stretch" />
          <View style={styles.heroCircle} />
          <View style={styles.todayBadge}><Text style={styles.todayText}>HOJE</Text></View>
          <Text style={styles.heroTitle}>Seu dia na escola</Text>
          <Text style={styles.heroDescription}>Prova de Matemática · 10h30</Text>
          <Text style={styles.heroLink}>Ver calendário</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <Text style={styles.sectionLink}>Ver tudo</Text>
        </View>

        <View style={styles.shortcutGrid}>
          {[0, 2].map((start) => (
            <View key={start} style={styles.shortcutRow}>
              {shortcuts.slice(start, start + 2).map((item) => (
                <Pressable
                  key={item.title}
                  disabled={!item.route}
                  onPress={() => navigation.navigate(item.route)}
                  style={styles.shortcut}
                  accessibilityRole="button"
                >
                  <View style={[styles.shortcutIconBox, { backgroundColor: item.tint }]}>
                    <Image source={item.icon} style={styles.shortcutIcon} resizeMode="contain" />
                  </View>
                  <View>
                    <Text style={styles.shortcutTitle}>{item.title}</Text>
                    <Text style={styles.shortcutOpen}>Abrir</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.lunchTitle}>Merenda de hoje</Text>
        <Pressable style={styles.lunchCard} onPress={() => navigation.navigate('Merenda')}>
          <View style={styles.lunchIconOuter}>
            <View style={styles.lunchIconInner}>
              <Image source={require('../../../assets/elo-home-meal.png')} style={styles.mealIcon} />
            </View>
          </View>
          <View style={styles.lunchText}>
            <Text style={styles.lunchTime}>Almoço · 11h às 13h30</Text>
            <Text style={styles.lunchMeal}>Frango assado</Text>
            <Text style={styles.lunchSides}>Arroz, feijão e salada</Text>
          </View>
        </Pressable>

        <View style={styles.notice}>
          <View style={styles.noticeDot} />
          <View style={styles.noticeText}>
            <Text style={styles.noticeTitle}>Reunião de famílias</Text>
            <Text style={styles.noticeDate}>Quinta, 1º de outubro · 18h</Text>
          </View>
          <Image source={require('../../../assets/elo-home-arrow.png')} style={styles.noticeArrow} />
        </View>
      </ScrollView>

      <EloTabBar active="Início" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FC' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 16 },
  header: { height: 47, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  brand: { height: 28, flexDirection: 'row', alignItems: 'center' },
  logoMark: { width: 22, height: 22, marginTop: 4 },
  logoEye: { position: 'absolute', left: 5, top: 13, width: 13, height: 8 },
  logoText: { marginLeft: 9, color: ink, fontSize: 23, lineHeight: 28, fontWeight: '700' },
  notification: { width: 40, height: 40, marginTop: 7, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  bell: { width: 12, height: 17 },
  notificationDot: { position: 'absolute', top: 6, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF6877' },
  greeting: { marginTop: 10, color: ink, fontSize: 23, lineHeight: 28, fontWeight: '700' },
  date: { marginTop: 5, color: muted, fontSize: 12, lineHeight: 15 },
  hero: { height: 150, marginTop: 19, borderRadius: 18, overflow: 'hidden' },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: 150 },
  heroCircle: { position: 'absolute', top: -30, right: -45, width: 142, height: 142, borderRadius: 71, backgroundColor: 'rgba(255,255,255,0.07)' },
  todayBadge: { position: 'absolute', top: 18, left: 17, width: 75, height: 25, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.19)' },
  todayText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  heroTitle: { position: 'absolute', top: 48, left: 17, color: '#FFFFFF', fontSize: 21, lineHeight: 25, fontWeight: '700' },
  heroDescription: { position: 'absolute', top: 83, left: 17, color: '#E7EDFF', fontSize: 13, lineHeight: 16 },
  heroLink: { position: 'absolute', top: 113, left: 17, color: '#FFFFFF', fontSize: 12, lineHeight: 15, fontWeight: '700' },
  sectionHeader: { marginTop: 18, height: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: ink, fontSize: 17, lineHeight: 21, fontWeight: '700' },
  sectionLink: { color: blue, fontSize: 11, fontWeight: '700' },
  shortcutGrid: { marginTop: 15, gap: 15 },
  shortcutRow: { flexDirection: 'row', gap: 8 },
  shortcut: { flex: 1, height: 76, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 18, backgroundColor: '#FFFFFF' },
  shortcutIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  shortcutIcon: { width: 16, height: 18 },
  shortcutTitle: { color: ink, fontSize: 13, lineHeight: 16, fontWeight: '700' },
  shortcutOpen: { marginTop: 6, color: muted, fontSize: 10, lineHeight: 12, fontWeight: '700' },
  lunchTitle: { marginTop: 22, color: ink, fontSize: 17, lineHeight: 21, fontWeight: '700' },
  lunchCard: { height: 90, marginTop: 12, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 18, backgroundColor: '#FFFFFF' },
  lunchIconOuter: { width: 62, height: 62, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E4F7F3' },
  lunchIconInner: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  mealIcon: { width: 14, height: 17 },
  lunchText: { marginLeft: 14 },
  lunchTime: { color: '#16A896', fontSize: 10, lineHeight: 12, fontWeight: '700' },
  lunchMeal: { marginTop: 7, color: ink, fontSize: 14, lineHeight: 17, fontWeight: '700' },
  lunchSides: { marginTop: 6, color: muted, fontSize: 11, lineHeight: 13 },
  notice: { height: 56, marginTop: 12, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 18, backgroundColor: '#FFFFFF' },
  noticeDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: blue },
  noticeText: { flex: 1, marginLeft: 9 },
  noticeTitle: { color: ink, fontSize: 12, lineHeight: 15, fontWeight: '700' },
  noticeDate: { marginTop: 4, color: muted, fontSize: 10, lineHeight: 12 },
  noticeArrow: { width: 16, height: 14 },
});
