import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/colors';

export default function Tag({ label, icon, background, textColor }) {
  return (
    <View style={[styles.tag, { backgroundColor: background }]}>
      {icon ? <Ionicons name={icon} size={12} color={textColor} style={{ marginRight: 4 }} /> : null}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
