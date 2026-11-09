import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import { contentTopStyle } from '../../styles/common';
import { muralStyles as styles } from '../../styles/screens/mural';

export default function MuralScreen({ navigation }) {
  const insets = useSafeAreaInsets();

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
          <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>AVISOS</Text></View>
          <Text style={styles.featuredTitle}>Mural indisponível</Text>
          <Text style={styles.featuredDate}>A API ainda não disponibiliza avisos.</Text>
          <Text style={styles.featuredLocation}>Tente novamente mais tarde.</Text>
          <View style={styles.featuredButton}><Text style={styles.featuredButtonText}>Indisponível</Text></View>
        </View>

        <Text style={styles.recentTitle}>Avisos recentes</Text>
        <View style={styles.unavailable}>
          <Text style={styles.unavailableText}>
            Nenhum aviso pode ser exibido porque o backend ainda não possui uma rota de leitura de avisos.
          </Text>
        </View>
      </ScrollView>
      <EloTabBar active="Mural" navigation={navigation} />
    </SafeAreaView>
  );
}
