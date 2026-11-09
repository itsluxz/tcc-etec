import { View, Text } from 'react-native';
import Card from './Card';
import { colors } from '../styles/global';
import { createGradeStyle, subjectRowStyles } from '../styles/components';

function gradeColor(grade) {
  if (grade >= 8) return colors.success;
  if (grade >= 6) return colors.warning;
  return colors.danger;
}

export default function SubjectRow({ name, grade, absences, frequency }) {
  return (
    <Card style={subjectRowStyles.card}>
      <View style={subjectRowStyles.row}>
        <View style={subjectRowStyles.content}>
          <Text style={subjectRowStyles.name}>{name}</Text>
          <Text style={subjectRowStyles.meta}>
            Faltas: {absences} · Frequência {frequency}%
          </Text>
        </View>
        <Text style={[subjectRowStyles.grade, createGradeStyle(gradeColor(grade))]}>{grade.toFixed(1).replace('.', ',')}</Text>
      </View>
    </Card>
  );
}
