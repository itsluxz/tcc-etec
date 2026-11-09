import { Image, Pressable, Text, View } from 'react-native';
import { createTabIconStyle, eloTabBarStyles as styles } from '../styles/components';

const studentTabs = [
  {
    name: 'Início',
    route: 'Início',
    activeIcon: require('../../assets/elo-home-tab-home.png'),
    inactiveIcon: require('../../assets/elo-tab-home-inactive.png'),
  },
  {
    name: 'Mural',
    route: 'Mural',
    activeIcon: require('../../assets/elo-home-mural.png'),
    inactiveIcon: require('../../assets/elo-home-tab-mural.png'),
  },
  {
    name: 'Boletim',
    route: 'Boletim',
    inactiveIcon: require('../../assets/elo-home-tab-agenda.png'),
  },
  {
    name: 'Merenda',
    route: 'Merenda',
    inactiveIcon: require('../../assets/elo-home-tab-meal.png'),
  },
  {
    name: 'Reservas',
    route: 'Reservas',
    activeIcon: require('../../assets/elo-reservas-flask-blue.png'),
    inactiveIcon: require('../../assets/elo-reservas-flask-blue.png'),
  },
  {
    name: 'Ajuda',
    route: 'Ajuda',
    activeIcon: require('../../assets/elo-help-tab-active.png'),
    inactiveIcon: require('../../assets/elo-home-tab-help.png'),
  },
];

const professorTabs = [
  {
    name: 'Início', route: 'Início',
    inactiveIcon: require('../../assets/elo-tab-home-inactive.png'),
  },
  {
    name: 'Reservas', route: 'Reservas',
    activeIcon: require('../../assets/elo-reservas-flask-blue.png'),
    inactiveIcon: require('../../assets/elo-reservas-flask-blue.png'),
  },
  {
    name: 'Ajuda', route: 'Ajuda',
    activeIcon: require('../../assets/elo-help-tab-active.png'),
    inactiveIcon: require('../../assets/elo-home-tab-help.png'),
  },
];

export default function EloTabBar({ active, navigation, variant = 'student' }) {
  const tabs = variant === 'professor' ? professorTabs : studentTabs;

  return (
    <View style={[styles.bar, variant === 'professor' && styles.professorBar]}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.name}
          style={styles.slot}
          disabled={!tab.route}
          onPress={() => navigation.navigate(tab.route)}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === tab.name, disabled: !tab.route }}
        >
          <View style={[styles.pill, variant === 'professor' && styles.professorPill, active === tab.name && styles.activePill]}>
            <Image
              source={active === tab.name ? (tab.activeIcon ?? tab.inactiveIcon) : tab.inactiveIcon}
              style={createTabIconStyle(tab.name, active === tab.name, Boolean(tab.activeIcon))}
            />
            <Text style={[styles.label, active === tab.name && styles.activeLabel]}>{tab.name}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
