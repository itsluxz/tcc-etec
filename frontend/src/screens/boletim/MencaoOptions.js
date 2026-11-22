import { Pressable, Text, View } from 'react-native';
import { createMencaoStyle, boletimStyles as styles } from '../../styles/screens/boletim';

const mencoes = ['I', 'R', 'B', 'MB'];

// as três menções que formam a nota; a final é a média delas (calculada pela API)
export const tiposMencao = [
  { campo: 'mencao_trabalho', label: 'Trabalho' },
  { campo: 'mencao_atividades', label: 'Atividades' },
  { campo: 'mencao_prova', label: 'Prova' },
];

// os 4 botões de menção; o escolhido fica com a cor dele
export default function MencaoOptions({ value, onChange }) {
  return (
    <View style={styles.options}>
      {mencoes.map((item) => {
        const mencaoStyle = createMencaoStyle(item);
        return (
          <Pressable
            key={item}
            style={[styles.option, value === item && mencaoStyle.pill]}
            onPress={() => onChange(item)}
          >
            <Text style={[styles.optionText, value === item && mencaoStyle.text]}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
