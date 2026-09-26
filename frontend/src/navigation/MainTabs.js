import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import LunchScreen from '../screens/lunch/LunchScreen';
import ReportScreen from '../screens/report/ReportScreen';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const icons = {
  Início: { active: 'home', inactive: 'home-outline' },
  Almoço: { active: 'restaurant', inactive: 'restaurant-outline' },
  Boletim: { active: 'document-text', inactive: 'document-text-outline' },
  Horário: { active: 'calendar', inactive: 'calendar-outline' },
};

export default function MainTabs() {
  return (
    <Tab.Navigator
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
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Almoço" component={LunchScreen} />
      <Tab.Screen name="Boletim" component={ReportScreen} />
      <Tab.Screen name="Horário" component={ScheduleScreen} />
    </Tab.Navigator>
  );
}
