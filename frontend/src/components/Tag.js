import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  createTagContainerStyle,
  createTagLabelStyle,
  tagStyles,
} from '../styles/components';

export default function Tag({ label, icon, background, textColor }) {
  return (
    <View style={[tagStyles.tag, createTagContainerStyle(background)]}>
      {icon ? <Ionicons name={icon} size={12} color={textColor} style={tagStyles.icon} /> : null}
      <Text style={[tagStyles.label, createTagLabelStyle(textColor)]}>{label}</Text>
    </View>
  );
}
