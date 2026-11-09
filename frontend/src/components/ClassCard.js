import { View, Text } from 'react-native';
import Card from './Card';
import Tag from './Tag';
import { colors } from '../styles/global';
import { classCardStyles } from '../styles/components';

const accentMap = {
  primary: colors.primary,
  info: colors.info,
  warning: colors.warning,
  success: colors.success,
  danger: colors.danger,
};

export default function ClassCard({ time, subject, teacher, location, color = 'primary' }) {
  const accent = accentMap[color] ?? colors.primary;

  return (
    <View style={classCardStyles.row}>
      <Text style={classCardStyles.time}>{time}</Text>
      <Card style={[classCardStyles.card, { borderLeftColor: accent }]}>
        <Text style={classCardStyles.subject}>{subject}</Text>
        <Text style={classCardStyles.teacher}>{teacher}</Text>
        <Tag label={location} icon="location-sharp" background={colors.tagPink} textColor={colors.tagPinkText} />
      </Card>
    </View>
  );
}
