import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const studentTabs = [
  {
    name: 'Início',
    route: 'Início',
    activeIcon: require('../../assets/elo-home-tab-home.png'),
    inactiveIcon: require('../../assets/elo-tab-home-inactive.png'),
    width: 18,
    height: 18,
  },
  {
    name: 'Mural',
    route: 'Mural',
    activeIcon: require('../../assets/elo-home-mural.png'),
    inactiveIcon: require('../../assets/elo-home-tab-mural.png'),
    width: 16,
    height: 16,
  },
  {
    name: 'Merenda',
    route: 'Merenda',
    inactiveIcon: require('../../assets/elo-home-tab-meal.png'),
    width: 14,
    height: 17,
  },
  {
    name: 'Reservas',
    route: 'Reservas',
    activeIcon: require('../../assets/elo-reservas-flask-blue.png'),
    inactiveIcon: require('../../assets/elo-reservas-flask-blue.png'),
    inactiveTintColor: '#71809B',
    width: 17,
    height: 18,
  },
  {
    name: 'Ajuda',
    inactiveIcon: require('../../assets/elo-home-tab-help.png'),
    width: 16,
    height: 16,
  },
];

const professorTabs = [
  {
    name: 'Início', route: 'Início',
    inactiveIcon: require('../../assets/elo-tab-home-inactive.png'),
    width: 18, height: 18,
  },
  {
    name: 'Reservas', route: 'Reservas',
    activeIcon: require('../../assets/elo-reservas-flask-blue.png'),
    inactiveIcon: require('../../assets/elo-reservas-flask-blue.png'),
    inactiveTintColor: '#71809B',
    width: 17, height: 18,
  },
  {
    name: 'Ajuda',
    inactiveIcon: require('../../assets/elo-home-tab-help.png'),
    width: 16, height: 16,
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
              style={{ width: tab.width, height: tab.height, tintColor: active === tab.name ? (tab.activeIcon ? undefined : '#3264F5') : tab.inactiveTintColor }}
            />
            <Text style={[styles.label, active === tab.name && styles.activeLabel]}>{tab.name}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 74,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5EBF3',
    backgroundColor: '#FFFFFF',
  },
  professorBar: { paddingHorizontal: 8 },
  slot: { flex: 1, alignItems: 'center' },
  pill: {
    width: '90%',
    height: 48,
    marginTop: 9,
    paddingBottom: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  professorPill: { width: 82 },
  activePill: { backgroundColor: '#E8EEFF' },
  label: { color: '#71809B', fontSize: 10, lineHeight: 12 },
  activeLabel: { color: '#3264F5', fontWeight: '700' },
});
