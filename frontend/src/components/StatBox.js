import { View, Text } from 'react-native';
import { statBoxStyles } from '../styles/components';

// `highlighted` renders the solid-purple version (e.g. "Média geral"),
// otherwise it renders as a plain white card (e.g. "Frequência").
export default function StatBox({ label, value, highlighted }) {
  return (
    <View
      style={[
        statBoxStyles.box,
        highlighted ? statBoxStyles.highlighted : statBoxStyles.plain,
      ]}
    >
      <Text style={[statBoxStyles.label, highlighted && statBoxStyles.labelHighlighted]}>{label}</Text>
      <Text style={[statBoxStyles.value, highlighted && statBoxStyles.valueHighlighted]}>{value}</Text>
    </View>
  );
}
