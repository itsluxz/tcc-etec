import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notasApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { primaryButtonStyles } from '../../styles/common';
import { boletimColors, createMencaoStyle, boletimStyles as styles } from '../../styles/screens/boletim';
import MencaoOptions, { tiposMencao } from './MencaoOptions';

// colunas do cartão: as três menções e a final
const colunas = [...tiposMencao, { campo: 'mencao_final', label: 'Final' }];

// cartão de uma nota na tela do professor, com o menu de 3 pontinhos (editar e excluir)
export default function NotaCard({ nota, onChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [mencoes, setMencoes] = useState({});
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function toggleMenu() {
    setMenuOpen(!menuOpen);
    setConfirmDelete(false);
  }

  function startEdit() {
    // a edição começa com as menções atuais da nota
    setMencoes({
      mencao_trabalho: nota.mencao_trabalho,
      mencao_atividades: nota.mencao_atividades,
      mencao_prova: nota.mencao_prova,
    });
    setEditing(true);
    setMenuOpen(false);
    setErrorMessage('');
  }

  async function handleUpdate() {
    setSaving(true);
    setErrorMessage('');

    try {
      await notasApi.update(nota.id, mencoes);
      setEditing(false);
      onChange();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível atualizar a nota.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setErrorMessage('');

    try {
      await notasApi.remove(nota.id);
      onChange();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível excluir a nota.'));
      setMenuOpen(false);
    }
  }

  return (
    <View style={styles.subjectCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={styles.subjectName}>
            {nota.disciplina?.nome} · {nota.bimestre}º bim
          </Text>
          <Text style={styles.subjectMeta}>
            {nota.aluno?.nome} · {nota.turma?.nome}
          </Text>
        </View>
        <Pressable onPress={toggleMenu} hitSlop={10} accessibilityRole="button" accessibilityLabel="Opções da nota">
          <Ionicons name="ellipsis-vertical" size={18} color={boletimColors.muted} />
        </Pressable>
      </View>

      {menuOpen && (
        <View style={styles.menu}>
          {confirmDelete ? (
            <>
              <Text style={styles.menuQuestion}>Excluir esta nota?</Text>
              <View style={styles.menuRow}>
                <Pressable onPress={() => setConfirmDelete(false)}>
                  <Text style={styles.menuItem}>Cancelar</Text>
                </Pressable>
                <Pressable onPress={handleDelete}>
                  <Text style={[styles.menuItem, styles.menuItemDanger]}>Excluir</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.menuRow}>
              <Pressable onPress={startEdit}>
                <Text style={styles.menuItem}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => setConfirmDelete(true)}>
                <Text style={[styles.menuItem, styles.menuItemDanger]}>Excluir</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {editing ? (
        <>
          {tiposMencao.map((tipo) => (
            <View key={tipo.campo}>
              <Text style={styles.formLabel}>{tipo.label}</Text>
              <MencaoOptions
                value={mencoes[tipo.campo]}
                onChange={(valor) => setMencoes({ ...mencoes, [tipo.campo]: valor })}
              />
            </View>
          ))}

          <View style={styles.editButtons}>
            <Pressable
              style={[primaryButtonStyles.button, styles.editSaveButton, saving && primaryButtonStyles.disabled]}
              onPress={handleUpdate}
              disabled={saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
            >
              <Text style={primaryButtonStyles.label}>{saving ? 'Salvando...' : 'Salvar'}</Text>
            </Pressable>
            <Pressable onPress={() => setEditing(false)} accessibilityRole="button">
              <Text style={styles.editCancel}>Cancelar</Text>
            </Pressable>
          </View>
        </>
      ) : (
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
      )}

      {errorMessage ? <Text style={styles.formError}>{errorMessage}</Text> : null}
    </View>
  );
}
