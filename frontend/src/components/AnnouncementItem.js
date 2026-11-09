import { View, Text } from 'react-native';
import { colors } from '../styles/global';
import {
  announcementItemStyles,
  createAnnouncementDotStyle,
} from '../styles/components';

export default function AnnouncementItem({ title, description, highlighted }) {
  return (
    <View style={announcementItemStyles.row}>
      <View style={[announcementItemStyles.dot, createAnnouncementDotStyle(highlighted)]} />
      <View style={announcementItemStyles.content}>
        <Text style={announcementItemStyles.title}>{title}</Text>
        <Text style={announcementItemStyles.description}>{description}</Text>
      </View>
    </View>
  );
}
