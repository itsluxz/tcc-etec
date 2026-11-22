import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import { contentTopStyle } from '../../styles/common';
import { atendimentoStyles as styles } from '../../styles/screens/atendimento';

export default function AtendimentoScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const variant = route.params?.profile === 'Professor' ? 'professor' : 'student';

  function showUnavailable() {
    Alert.alert('Atendimento indisponível', 'Não é possível exibir solicitações pessoais com segurança no momento.');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentTopStyle(insets.top)]}
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
          <View style={styles.openBadge}><Text style={styles.openBadgeText}>Indisponível</Text></View>
        </View>

        <View style={styles.unavailable}>
          <Text style={styles.unavailableText}>
            A API de atendimentos não aplica autenticação nem filtro por usuário. As solicitações ficam ocultas para evitar exibir dados de outras pessoas.
          </Text>
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
