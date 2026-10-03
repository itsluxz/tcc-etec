import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';

const ink = '#172441';
const muted = '#71809B';
const blue = '#3264F5';

const notices = [
  {
    title: 'Feira de Ciências',
    description: 'Inscrições abertas até 5 de outubro.',
    icon: require('../../../assets/elo-mural-calendar.png'),
    tint: '#E4F7F3',
    unread: true,
  },
  {
    title: 'Transporte escolar',
    description: 'Novos horários para outubro.',
    icon: require('../../../assets/elo-mural-transport.png'),
    tint: '#F1EBFF',
  },
  {
    title: 'Semana de leitura',
    description: 'Programação começa segunda-feira.',
    icon: require('../../../assets/elo-mural-reading.png'),
    tint: '#FFF2DF',
  },
];

export default function MuralScreen({ navigation }) {
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

        <Text style={styles.title}>Mural de avisos</Text>
        <Text style={styles.subtitle}>Novidades e comunicados da escola</Text>

        <View style={styles.search}>
          <Image source={require('../../../assets/elo-mural-search.png')} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Buscar avisos</Text>
        </View>

        <View style={styles.filters}>
          <View style={[styles.filter, styles.allFilter]}><Text style={[styles.filterText, styles.allFilterText]}>Todos</Text></View>
          <View style={[styles.filter, styles.urgentFilter]}><Text style={styles.filterText}>Urgentes</Text></View>
          <View style={[styles.filter, styles.eventsFilter]}><Text style={styles.filterText}>Eventos</Text></View>
        </View>

        <View style={styles.featured}>
          <Image source={require('../../../assets/elo-mural-featured.png')} style={styles.featuredImage} resizeMode="stretch" />
          <View style={styles.featuredCircle} />
          <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>DESTAQUE</Text></View>
          <Text style={styles.featuredTitle}>Reunião de famílias</Text>
          <Text style={styles.featuredDate}>Quinta, 1º de outubro, às 18h.</Text>
          <Text style={styles.featuredLocation}>Auditório principal.</Text>
          <View style={styles.featuredButton}><Text style={styles.featuredButtonText}>Ler aviso</Text></View>
        </View>

        <Text style={styles.recentTitle}>Avisos recentes</Text>
        <View style={styles.noticeList}>
          {notices.map((notice) => (
            <View key={notice.title} style={styles.notice}>
              <View style={[styles.noticeIconBox, { backgroundColor: notice.tint }]}>
                <Image source={notice.icon} style={styles.noticeIcon} resizeMode="contain" />
              </View>
              <View style={styles.noticeCopy}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDescription}>{notice.description}</Text>
              </View>
              <View style={[styles.noticeDot, notice.unread && styles.unreadDot]} />
            </View>
          ))}
        </View>
      </ScrollView>
      <EloTabBar active="Mural" navigation={navigation} />
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
  search: { height: 41, marginTop: 19, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 11, backgroundColor: '#FFFFFF' },
  searchIcon: { width: 16, height: 16 },
  searchPlaceholder: { marginLeft: 10, color: '#AAB5C8', fontSize: 12, lineHeight: 15 },
  filters: { height: 28, marginTop: 14, flexDirection: 'row', gap: 8 },
  filter: { height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#FFFFFF' },
  allFilter: { width: 59, backgroundColor: '#E8EEFF' },
  urgentFilter: { width: 78 },
  eventsFilter: { width: 71 },
  filterText: { color: muted, fontSize: 10, fontWeight: '700' },
  allFilterText: { color: blue },
  featured: { height: 201, marginTop: 17, borderRadius: 18, overflow: 'hidden' },
  featuredImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: 201 },
  featuredCircle: { position: 'absolute', top: -39, right: -34, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.07)' },
  featuredBadge: { position: 'absolute', top: 17, left: 17, width: 86, height: 25, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  featuredBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  featuredTitle: { position: 'absolute', top: 59, left: 17, color: '#FFFFFF', fontSize: 20, lineHeight: 24, fontWeight: '700' },
  featuredDate: { position: 'absolute', top: 91, left: 17, color: '#E5ECFF', fontSize: 12, lineHeight: 15 },
  featuredLocation: { position: 'absolute', top: 111, left: 17, color: '#E5ECFF', fontSize: 12, lineHeight: 15 },
  featuredButton: { position: 'absolute', top: 153, left: 17, width: 112, height: 31, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  featuredButtonText: { color: blue, fontSize: 11, fontWeight: '700' },
  recentTitle: { marginTop: 21, color: ink, fontSize: 17, lineHeight: 21, fontWeight: '700' },
  noticeList: { marginTop: 13, gap: 8 },
  notice: { height: 68, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 18, backgroundColor: '#FFFFFF' },
  noticeIconBox: { width: 39, height: 39, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  noticeIcon: { width: 16, height: 18 },
  noticeCopy: { flex: 1, marginLeft: 11 },
  noticeTitle: { color: ink, fontSize: 13, lineHeight: 16, fontWeight: '700' },
  noticeDescription: { marginTop: 7, color: muted, fontSize: 10, lineHeight: 12 },
  noticeDot: { width: 7, height: 7, marginRight: 6, borderRadius: 4, backgroundColor: '#E5EBF3' },
  unreadDot: { backgroundColor: blue },
});
