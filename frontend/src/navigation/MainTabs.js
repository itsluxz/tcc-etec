import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import CantinaScreen from '../screens/cantina/CantinaScreen';
import MuralScreen from '../screens/mural/MuralScreen';
import BoletimScreen from '../screens/boletim/BoletimScreen';
import ReservasScreen from '../screens/reservas/ReservasScreen';
import AtendimentoScreen from '../screens/atendimento/AtendimentoScreen';
import { colors } from '../styles/global';
import { navigationStyles } from '../styles/navigation';

const Tab = createBottomTabNavigator();

const icons = {
  Início: { active: 'home', inactive: 'home-outline' },
  Boletim: { active: 'school', inactive: 'school-outline' },
  Mural: { active: 'document-text', inactive: 'document-text-outline' },
  Merenda: { active: 'restaurant', inactive: 'restaurant-outline' },
  Reservas: { active: 'flask', inactive: 'flask-outline' },
  Ajuda: { active: 'chatbox', inactive: 'chatbox-outline' },
};

export default function MainTabs({ route }) {
  // todas as abas recebem o perfil e o usuário logado
  const userParams = { profile: route.params?.profile, user: route.params?.user };

  return (
    <Tab.Navigator
      initialRouteName={route.params?.profile === 'Professor' ? 'Reservas' : 'Início'}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: navigationStyles.tabBar,
        tabBarLabelStyle: navigationStyles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icon = icons[route.name];
          return <Ionicons name={focused ? icon.active : icon.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} initialParams={userParams} options={{ tabBarStyle: navigationStyles.hiddenTabBar }} />
      <Tab.Screen name="Boletim" component={BoletimScreen} initialParams={userParams} options={{ tabBarStyle: navigationStyles.hiddenTabBar }} />
      <Tab.Screen name="Mural" component={MuralScreen} initialParams={userParams} options={{ tabBarStyle: navigationStyles.hiddenTabBar }} />
      <Tab.Screen name="Merenda" component={CantinaScreen} initialParams={userParams} options={{ tabBarStyle: navigationStyles.hiddenTabBar }} />
      <Tab.Screen name="Reservas" component={ReservasScreen} initialParams={userParams} options={{ tabBarStyle: navigationStyles.hiddenTabBar }} />
      <Tab.Screen name="Ajuda" component={AtendimentoScreen} initialParams={userParams} options={{ tabBarStyle: navigationStyles.hiddenTabBar }} />
    </Tab.Navigator>
  );
}
