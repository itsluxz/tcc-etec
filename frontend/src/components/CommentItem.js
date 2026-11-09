import { View, Text } from 'react-native';
import Card from './Card';
import Avatar from './Avatar';
import { colors } from '../styles/global';
import { commentItemStyles } from '../styles/components';

export default function CommentItem({ teacher, subject, initials, text }) {
  return (
    <Card style={commentItemStyles.card}>
      <View style={commentItemStyles.header}>
        <Avatar initials={initials} size={32} background={colors.primaryLight} textColor={colors.primary} />
        <Text style={commentItemStyles.name}>
          {teacher} <Text style={commentItemStyles.subject}>· {subject}</Text>
        </Text>
      </View>
      <Text style={commentItemStyles.text}>{text}</Text>
    </Card>
  );
}
