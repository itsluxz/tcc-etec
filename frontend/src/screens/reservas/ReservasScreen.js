import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';

const ink = '#172441';
const muted = '#71809B';
const blue = '#3264F5';

const rooms = [
  {
    name: 'Lab. de Ciências', places: '24 lugares', tint: '#E4F7F3',
    icon: require('../../../assets/elo-reservas-flask-green.png'),
    slots: [{ hour: '07h', free: false }, { hour: '08h', free: true }, { hour: '09h', free: false }],
  },
  {
    name: 'Lab. de Informática', places: '30 lugares', tint: '#E8EEFF',
    icon: require('../../../assets/elo-reservas-flask-blue.png'),
    slots: [{ hour: '09h', free: false }, { hour: '10h', free: false }, { hour: '11h', free: true }],
  },
  {
    name: 'Sala Multimídia', places: '35 lugares', tint: '#F1EBFF',
    icon: require('../../../assets/elo-reservas-flask-purple.png'),
    slots: [{ hour: '10h', free: true }, { hour: '11h', free: false }, { hour: '12h', free: false }],
  },
];

export default function ReservasScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState('Manhã');

  function showReservationInfo(room, hour) {
    const choice = room && hour ? `${room} às ${hour}. ` : '';
    Alert.alert('Nova reserva', `${choice}O envio da reserva ainda não está conectado ao sistema.`);
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

        <Text style={styles.title}>Reservas</Text>
        <Text style={styles.subtitle}>Laboratórios e salas disponíveis</Text>

        <View style={styles.hero}>
          <Image source={require('../../../assets/elo-reservas-banner.png')} style={styles.heroImage} resizeMode="stretch" />
          <Text style={styles.heroTitle}>Organize sua próxima aula</Text>
          <Text style={styles.heroSubtitle}>Consulte horários e reserve um espaço.</Text>
          <Pressable style={styles.newReservation} onPress={() => showReservationInfo()} accessibilityRole="button">
            <Text style={styles.newReservationText}>Nova reserva</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Disponibilidade</Text>
          <Text style={styles.sectionDate}>28 set</Text>
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

        {period === 'Tarde' ? (
          <Text style={styles.emptyText}>Não há horários da tarde neste exemplo.</Text>
        ) : (
          <View style={styles.roomList}>
            {rooms.map((room) => (
              <View key={room.name} style={styles.roomCard}>
                <View style={styles.roomHeader}>
                  <View style={[styles.roomIconBox, { backgroundColor: room.tint }]}>
                    <Image source={room.icon} style={styles.roomIcon} resizeMode="contain" />
                  </View>
                  <View style={styles.roomCopy}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomPlaces}>{room.places}</Text>
                  </View>
                </View>
                <View style={styles.slots}>
                  {room.slots.map((slot) => (
                    <Pressable
                      key={slot.hour}
                      style={[styles.slot, slot.free ? styles.freeSlot : styles.busySlot]}
                      disabled={!slot.free}
                      onPress={() => showReservationInfo(room.name, slot.hour)}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: !slot.free }}
                    >
                      <Text style={[styles.slotText, slot.free ? styles.freeSlotText : styles.busySlotText]}>
                        {slot.hour} {slot.free ? 'Livre' : 'Ocupado'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footnote}>Toque em um horário livre para reservar.</Text>
      </ScrollView>
      <EloTabBar active="Reservas" navigation={navigation} variant={route.params?.profile === 'Professor' ? 'professor' : 'student'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FC' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 19 },
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
  hero: { height: 100, marginTop: 19, borderRadius: 17, overflow: 'hidden' },
  heroImage: { position: 'absolute', width: '100%', height: 100 },
  heroTitle: { marginTop: 15, marginLeft: 16, color: '#FFFFFF', fontSize: 17, lineHeight: 21, fontWeight: '700' },
  heroSubtitle: { marginTop: 8, marginLeft: 16, color: '#E7EDFF', fontSize: 11, lineHeight: 13 },
  newReservation: { width: 115, height: 25, marginTop: 11, marginLeft: 16, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  newReservationText: { color: blue, fontSize: 10, fontWeight: '700' },
  sectionHeader: { height: 21, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: ink, fontSize: 17, lineHeight: 21, fontWeight: '700' },
  sectionDate: { color: blue, fontSize: 11, lineHeight: 13, fontWeight: '700' },
  periods: { height: 26, marginTop: 11, flexDirection: 'row', gap: 7 },
  period: { height: 26, paddingHorizontal: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  selectedPeriod: { backgroundColor: '#E8EEFF' },
  periodText: { color: muted, fontSize: 10, fontWeight: '700' },
  selectedPeriodText: { color: blue },
  roomList: { marginTop: 19, gap: 12 },
  roomCard: { height: 106, padding: 12, borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 18, backgroundColor: '#FFFFFF' },
  roomHeader: { height: 36, flexDirection: 'row', alignItems: 'center' },
  roomIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  roomIcon: { width: 17, height: 18 },
  roomCopy: { marginLeft: 11 },
  roomName: { color: ink, fontSize: 13, lineHeight: 16, fontWeight: '700' },
  roomPlaces: { marginTop: 5, color: muted, fontSize: 10, lineHeight: 12 },
  slots: { height: 29, marginTop: 14, flexDirection: 'row', gap: 10 },
  slot: { flex: 1, height: 29, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  busySlot: { backgroundColor: '#E8EEFF' },
  freeSlot: { backgroundColor: '#E4F7F3' },
  slotText: { fontSize: 10, fontWeight: '700' },
  busySlotText: { color: blue },
  freeSlotText: { color: '#16A896' },
  emptyText: { marginTop: 30, color: muted, fontSize: 12, textAlign: 'center' },
  footnote: { marginTop: 28, color: '#AAB5C8', fontSize: 10, lineHeight: 12 },
});
