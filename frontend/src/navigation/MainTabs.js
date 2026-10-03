import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import CantinaScreen from '../screens/cantina/CantinaScreen';
import MuralScreen from '../screens/mural/MuralScreen';
import ReservasScreen from '../screens/reservas/ReservasScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const icons = {
  Início: { active: 'home', inactive: 'home-outline' },
  Merenda: { active: 'restaurant', inactive: 'restaurant-outline' },
  Mural: { active: 'document-text', inactive: 'document-text-outline' },
  Reservas: { active: 'flask', inactive: 'flask-outline' },
};

export default function MainTabs({ route }) {
  return (
    <Tab.Navigator
      initialRouteName={route.params?.profile === 'Professor' ? 'Reservas' : 'Início'}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icon = icons[route.name];
          return <Ionicons name={focused ? icon.active : icon.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} options={{ tabBarStyle: { display: 'none' } }} />
      <Tab.Screen name="Mural" component={MuralScreen} options={{ tabBarStyle: { display: 'none' } }} />
      <Tab.Screen name="Merenda" component={CantinaScreen} options={{ tabBarStyle: { display: 'none' } }} />
      <Tab.Screen name="Reservas" component={ReservasScreen} initialParams={{ profile: route.params?.profile }} options={{ tabBarStyle: { display: 'none' } }} />
    </Tab.Navigator>
  );
}
