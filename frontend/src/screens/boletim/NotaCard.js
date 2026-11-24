import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { boletimColors, createMencaoStyle, boletimStyles as styles } from '../../styles/screens/boletim';
import { tiposMencao } from './MencaoOptions';

// colunas do cartão: as três menções e a final
const colunas = [...tiposMencao, { campo: 'mencao_final', label: 'Final' }];

// cartão de uma nota na tela do professor; ao tocar, abre o modal (ver, trocar menções e excluir)
export default function NotaCard({ nota, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.subjectCard, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir nota de ${nota.disciplina?.nome}, ${nota.aluno?.nome}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={styles.subjectName}>
            {nota.disciplina?.nome} · {nota.bimestre}º bim
          </Text>
          <Text style={styles.subjectMeta}>
            {nota.aluno?.nome} · {nota.turma?.nome}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={boletimColors.muted} />
      </View>

      <View style={styles.bimestres}>
        {colunas.map((coluna) => {
          const mencao = nota[coluna.campo];
          const mencaoStyle = createMencaoStyle(mencao);

          return (
            <View key={coluna.campo} style={styles.bimestre}>
              <Text style={[styles.bimestreLabel, coluna.campo === 'mencao_final' && styles.finalLabel]}>{coluna.label}</Text>
              <View style={[styles.mencaoPill, mencaoStyle.pill]}>
                <Text style={[styles.mencaoText, mencaoStyle.text]}>{mencao ?? '—'}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
