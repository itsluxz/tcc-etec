import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import { contentTopStyle } from '../../styles/common';
import { reservasStyles as styles } from '../../styles/screens/reservas';

export default function ReservasScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState('Manhã');
  const currentDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date());

  function showReservationInfo() {
    Alert.alert('Reservas indisponíveis', 'A API ainda não disponibiliza dados de salas ou horários.');
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

        <Text style={styles.title}>Reservas</Text>
        <Text style={styles.subtitle}>Laboratórios e salas disponíveis</Text>

        <View style={styles.hero}>
          <Image source={require('../../../assets/elo-reservas-banner.png')} style={styles.heroImage} resizeMode="stretch" />
          <Text style={styles.heroTitle}>Organize sua próxima aula</Text>
          <Text style={styles.heroSubtitle}>Consulte horários e reserve um espaço.</Text>
          <Pressable style={styles.newReservation} onPress={showReservationInfo} accessibilityRole="button">
            <Text style={styles.newReservationText}>Nova reserva</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Disponibilidade</Text>
          <Text style={styles.sectionDate}>{currentDate}</Text>
        </View>

        <View style={styles.periods}>
          {['Manhã', 'Tarde', 'Todos'].map((item) => (
            <Pressable
              key={item}
              style={[styles.period, period === item && styles.selectedPeriod]}
              onPress={() => setPeriod(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: period === item }}
            >
              <Text style={[styles.periodText, period === item && styles.selectedPeriodText]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.unavailable}>
          <Text style={styles.unavailableText}>
            A API de reservas ainda não disponibiliza salas, horários ou reservas para consulta.
          </Text>
        </View>

        <Text style={styles.footnote}>A disponibilidade será exibida quando os dados estiverem conectados.</Text>
      </ScrollView>
      <EloTabBar active="Reservas" navigation={navigation} variant={route.params?.profile === 'Professor' ? 'professor' : 'student'} />
    </SafeAreaView>
  );
}
