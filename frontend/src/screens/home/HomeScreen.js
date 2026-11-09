import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import EloTabBar from '../../components/EloTabBar';
import { cardapiosApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { contentTopStyle } from '../../styles/common';
import {
  createShortcutIconBoxStyle,
  homeShortcutTints,
  homeStyles as styles,
} from '../../styles/screens/home';

const shortcuts = [
  { title: 'Mural', icon: require('../../../assets/elo-home-mural.png'), route: 'Mural' },
  { title: 'Boletim', icon: require('../../../assets/elo-home-tab-agenda.png'), route: 'Boletim' },
  { title: 'Merenda', icon: require('../../../assets/elo-home-meal.png'), route: 'Merenda' },
  { title: 'Reservas', icon: require('../../../assets/elo-reservas-flask-blue.png'), route: 'Reservas' },
  { title: 'Ajuda', icon: require('../../../assets/elo-home-help.png'), route: 'Ajuda' },
];

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function HomeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [menu, setMenu] = useState(null);
  const [menuStatus, setMenuStatus] = useState('loading');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadTodayMenu() {
        setMenuStatus('loading');

        try {
          const { data } = await cardapiosApi.list();
          if (!Array.isArray(data)) throw new Error('A resposta de cardápios está em um formato inválido.');
          const todayMenu = data.find((item) => item?.data === localDateKey(new Date())) ?? null;

          if (active) {
            setMenu(todayMenu);
            setMenuStatus('success');
          }
        } catch (error) {
          if (active) {
            setMenu(null);
            setMenuStatus(getApiErrorMessage(error, 'Não foi possível carregar o cardápio.'));
          }
        }
      }

      loadTodayMenu();
      return () => {
        active = false;
      };
    }, []),
  );

  const todayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const authenticatedName = route.params?.user?.nome;
  const userName = typeof authenticatedName === 'string' ? authenticatedName.trim() : '';
  const greetingName = userName ? userName.split(/\s+/)[0] : null;
  const menuDateLabel = menu?.data
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${menu.data}T12:00:00`))
    : menuStatus === 'loading'
      ? 'Carregando...'
      : '';
  const menuTitle = menu?.titulo ?? (
    menuStatus === 'loading'
      ? 'Buscando merenda...'
      : menuStatus === 'success'
        ? 'Sem cardápio para hoje'
        : 'Cardápio indisponível'
  );
  const menuDescription = menu?.descricao ?? (
    menuStatus === 'loading'
      ? ''
      : menuStatus === 'success'
        ? 'Nenhum cardápio cadastrado para hoje.'
        : menuStatus
  );

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

        <Text style={styles.greeting}>{greetingName ? `Bom dia, ${greetingName}!` : 'Olá!'}</Text>
        <Text style={styles.date}>{todayLabel}</Text>

        <View style={styles.hero}>
          <Image source={require('../../../assets/elo-home-hero.png')} style={styles.heroImage} resizeMode="stretch" />
          <View style={styles.heroCircle} />
          <View style={styles.todayBadge}><Text style={styles.todayText}>HOJE</Text></View>
          <Text style={styles.heroTitle}>Seu dia na escola</Text>
          <Text style={styles.heroDescription}>Eventos escolares não estão disponíveis no momento.</Text>
          <Text style={styles.heroLink}>Calendário</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <Text style={styles.sectionLink}>Ver tudo</Text>
        </View>

        <View style={styles.shortcutGrid}>
          {Array.from({ length: Math.ceil(shortcuts.length / 2) }, (_, index) => index * 2).map((start) => (
            <View key={start} style={styles.shortcutRow}>
              {shortcuts.slice(start, start + 2).map((item, index) => (
                <Pressable
                  key={item.title}
                  disabled={!item.route}
                  onPress={() => navigation.navigate(item.route)}
                  style={styles.shortcut}
                  accessibilityRole="button"
                >
                  <View style={[styles.shortcutIconBox, createShortcutIconBoxStyle(homeShortcutTints[start + index])]}>
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
            <Text style={styles.lunchTime}>
              {menuStatus === 'loading' ? 'Carregando cardápio...' : menuDateLabel}
            </Text>
            <Text style={styles.lunchMeal}>{menuTitle}</Text>
            <Text style={styles.lunchSides}>{menuDescription}</Text>
          </View>
        </Pressable>

        <View style={styles.notice}>
          <View style={styles.noticeDot} />
          <View style={styles.noticeText}>
            <Text style={styles.noticeTitle}>Calendário escolar</Text>
            <Text style={styles.noticeDate}>Eventos não estão disponíveis no momento.</Text>
          </View>
          <Image source={require('../../../assets/elo-home-arrow.png')} style={styles.noticeArrow} />
        </View>
      </ScrollView>

      <EloTabBar active="Início" navigation={navigation} />
    </SafeAreaView>
  );
}
