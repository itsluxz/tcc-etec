import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';

const ink = '#172441';
const muted = '#71809B';
const blue = '#3264F5';

const requests = [
  {
    title: 'Dúvida sobre atividade', details: '#2048 · Secretaria',
    status: 'Resposta recebida há 15 min', color: blue,
    icon: require('../../../assets/elo-help-chat.png'),
  },
  {
    title: 'Declaração de matrícula', details: '#2041 · Secretaria',
    status: 'Em análise desde ontem', color: '#E59A32',
    icon: require('../../../assets/elo-help-chat.png'),
  },
  {
    title: 'Transporte escolar', details: '#1997 · Atendimento',
    status: 'Concluído em 22 set', color: '#16A896',
    icon: require('../../../assets/elo-help-check.png'),
  },
];

export default function AtendimentoScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const variant = route.params?.profile === 'Professor' ? 'professor' : 'student';

  function showUnavailable() {
    Alert.alert('Atendimento', 'Esta função ainda não está conectada ao sistema da escola.');
  }

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

        <Text style={styles.title}>Atendimento</Text>
        <Text style={styles.subtitle}>Dúvidas e solicitações</Text>

        <View style={styles.hero}>
          <Image source={require('../../../assets/elo-help-banner.png')} style={styles.heroImage} resizeMode="stretch" />
          <View style={styles.heroCircle} />
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>ESTAMOS AQUI</Text></View>
          <Text style={styles.heroTitle}>Como podemos ajudar?</Text>
          <Text style={styles.heroSubtitle}>Fale com a escola sem sair do app.</Text>
          <Pressable style={styles.heroButton} onPress={showUnavailable} accessibilityRole="button">
            <Text style={styles.heroButtonText}>Nova solicitação</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minhas solicitações</Text>
          <View style={styles.openBadge}><Text style={styles.openBadgeText}>2 em aberto</Text></View>
        </View>

        <View style={styles.requestList}>
          {requests.map((request) => (
            <Pressable
              key={request.title}
              style={styles.requestCard}
              onPress={() => Alert.alert(request.title, `${request.details}\n${request.status}`)}
              accessibilityRole="button"
            >
              <View style={[styles.requestIconBox, { backgroundColor: request.color }]}>
                <Image source={request.icon} style={request.title === 'Transporte escolar' ? styles.checkIcon : styles.chatIcon} resizeMode="contain" />
              </View>
              <View style={styles.requestCopy}>
                <Text style={styles.requestTitle}>{request.title}</Text>
                <Text style={styles.requestDetails}>{request.details}</Text>
                <Text style={[styles.requestStatus, { color: request.color }]}>{request.status}</Text>
              </View>
              <Image source={require('../../../assets/elo-help-arrow.png')} style={styles.requestArrow} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.faqCard} onPress={showUnavailable} accessibilityRole="button">
          <Image source={require('../../../assets/elo-help-tab-active.png')} style={styles.faqIcon} />
          <View style={styles.faqCopy}>
            <Text style={styles.faqTitle}>Perguntas frequentes</Text>
            <Text style={styles.faqSubtitle}>Respostas rápidas para sua rotina</Text>
          </View>
          <Image source={require('../../../assets/elo-help-arrow.png')} style={styles.faqArrow} />
        </Pressable>
      </ScrollView>
      <EloTabBar active="Ajuda" navigation={navigation} variant={variant} />
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
  title: { marginTop: 10, color: ink, fontSize: 23, lineHeight: 28, fontWeight: '700' },
  subtitle: { marginTop: 5, color: muted, fontSize: 12, lineHeight: 15 },
  hero: { height: 154, marginTop: 19, borderRadius: 18, overflow: 'hidden' },
  heroImage: { position: 'absolute', width: '100%', height: 154 },
  heroCircle: { position: 'absolute', top: -26, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.07)' },
  heroBadge: { position: 'absolute', top: 15, left: 16, width: 84, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  heroBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  heroTitle: { position: 'absolute', top: 48, left: 16, color: '#FFFFFF', fontSize: 19, lineHeight: 23, fontWeight: '700' },
  heroSubtitle: { position: 'absolute', top: 78, left: 16, color: '#E7EDFF', fontSize: 12, lineHeight: 15 },
  heroButton: { position: 'absolute', top: 108, left: 16, width: 155, height: 31, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  heroButtonText: { color: blue, fontSize: 10, fontWeight: '700' },
  sectionHeader: { height: 26, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: ink, fontSize: 17, lineHeight: 21, fontWeight: '700' },
  openBadge: { width: 104, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EEFF' },
  openBadgeText: { color: blue, fontSize: 10, fontWeight: '700' },
  requestList: { marginTop: 14, gap: 12 },
  requestCard: { height: 92, borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 18, backgroundColor: '#FFFFFF' },
  requestIconBox: { position: 'absolute', top: 18, left: 13, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  chatIcon: { width: 16, height: 16 },
  checkIcon: { width: 16, height: 12 },
  requestCopy: { position: 'absolute', top: 12, left: 46 },
  requestTitle: { color: ink, fontSize: 13, lineHeight: 16, fontWeight: '700' },
  requestDetails: { marginTop: 7, color: muted, fontSize: 10, lineHeight: 12 },
  requestStatus: { marginTop: 13, fontSize: 10, lineHeight: 12, fontWeight: '700' },
  requestArrow: { position: 'absolute', top: 36, right: 16, width: 16, height: 14 },
  faqCard: { height: 50, marginTop: 20, borderWidth: 1, borderColor: '#E2E9FC', borderRadius: 17, backgroundColor: '#E8EEFF' },
  faqIcon: { position: 'absolute', top: 17, left: 16, width: 16, height: 16 },
  faqCopy: { position: 'absolute', top: 7, left: 44 },
  faqTitle: { color: ink, fontSize: 12, lineHeight: 15, fontWeight: '700' },
  faqSubtitle: { marginTop: 4, color: muted, fontSize: 10, lineHeight: 12 },
  faqArrow: { position: 'absolute', top: 17, right: 15, width: 16, height: 14, tintColor: blue },
});
