import { View, Text } from 'react-native';
import { colors } from '../styles/global';
import {
  avatarStyles,
  createAvatarContainerStyle,
  createAvatarTextStyle,
} from '../styles/components';

export default function Avatar({ initials, size = 44, background = colors.primary, textColor = colors.textInverse }) {
  return (
    <View
      style={[
        avatarStyles.avatar,
        createAvatarContainerStyle(size, background),
      ]}
    >
      <Text style={[avatarStyles.text, createAvatarTextStyle(size, textColor)]}>{initials}</Text>
    </View>
  );
}
