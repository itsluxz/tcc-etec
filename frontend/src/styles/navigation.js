import { StyleSheet } from 'react-native';
import { colors } from './global';

export const navigationStyles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    borderTopColor: colors.border,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  hiddenTabBar: { display: 'none' },
});
