import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Avatar({ initials, size = 44, background = colors.primary, textColor = colors.textInverse }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
      ]}
    >
      <Text style={[styles.text, { color: textColor, fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
});
