import { View } from 'react-native';
import { cardStyles } from '../styles/components';

export default function Card({ children, style }) {
  return <View style={[cardStyles.card, style]}>{children}</View>;
}
