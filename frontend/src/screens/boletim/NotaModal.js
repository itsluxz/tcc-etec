import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notasApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { primaryButtonStyles } from '../../styles/common';
import { boletimColors, createMencaoStyle, boletimStyles as styles } from '../../styles/screens/boletim';
import MencaoOptions, { tiposMencao } from './MencaoOptions';

function MencaoPill({ mencao }) {
  const mencaoStyle = createMencaoStyle(mencao);
  return (
    <View style={[styles.mencaoPill, mencaoStyle.pill]}>
      <Text style={[styles.mencaoText, mencaoStyle.text]}>{mencao ?? '—'}</Text>
    </View>
  );
}

// modal com as notas completas (trabalho, atividades, prova e final) de cada bimestre
// notas: { [bimestre]: nota }; bimestres: quais bimestres mostrar
// podeEditar: professor e gestão trocam as menções e excluem; aluno só vê
export default function NotaModal({ visible, title, subtitle, notas, bimestres, podeEditar, onClose, onChange }) {
  const [editingId, setEditingId] = useState(null);
  const [mencoes, setMencoes] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function reset() {
    setEditingId(null);
    setMencoes({});
    setConfirmDeleteId(null);
    setErrorMessage('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function startEdit(nota) {
    // a edição começa com as menções atuais; as vazias podem ser preenchidas agora
    setMencoes({
      mencao_trabalho: nota.mencao_trabalho,
      mencao_atividades: nota.mencao_atividades,
      mencao_prova: nota.mencao_prova,
    });
    setEditingId(nota.id);
    setConfirmDeleteId(null);
    setErrorMessage('');
  }

  async function handleUpdate() {
    setSaving(true);
    setErrorMessage('');
    try {
      await notasApi.update(editingId, mencoes);
      setEditingId(null);
      onChange();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível atualizar a nota.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(notaId) {
    setErrorMessage('');
    try {
      await notasApi.remove(notaId);
      setConfirmDeleteId(null);
      onChange();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível excluir a nota.'));
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalDismiss} onPress={handleClose} accessibilityLabel="Fechar" />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <View style={styles.cardTitle}>
              <Text style={styles.modalTitle}>{title}</Text>
              {subtitle ? <Text style={styles.subjectMeta}>{subtitle}</Text> : null}
            </View>
            <Pressable onPress={handleClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Fechar">
              <Ionicons name="close" size={22} color={boletimColors.muted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {bimestres.map((bimestre) => {
              const nota = notas[bimestre];
              const editing = nota && editingId === nota.id;

              return (
                <View key={bimestre} style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Text style={styles.modalSectionTitle}>{bimestre}º bimestre</Text>
                    {nota && !editing ? (
                      <View style={styles.modalFinal}>
                        <Text style={styles.finalLabel}>Final</Text>
                        <MencaoPill mencao={nota.mencao_final} />
                      </View>
                    ) : null}
                  </View>

                  {!nota ? (
                    <Text style={styles.formHint}>Nenhuma menção lançada.</Text>
                  ) : editing ? (
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
                        <Pressable onPress={() => setEditingId(null)} accessibilityRole="button">
                          <Text style={styles.editCancel}>Cancelar</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      {tiposMencao.map((tipo) => (
                        <View key={tipo.campo} style={styles.modalRow}>
                          <Text style={styles.modalRowLabel}>{tipo.label}</Text>
                          <MencaoPill mencao={nota[tipo.campo]} />
                        </View>
                      ))}

                      {nota.mencao_final ? null : (
                        <Text style={styles.formHint}>A menção final aparece quando as três estiverem lançadas.</Text>
                      )}
                      {nota.observacao ? <Text style={styles.modalObservacao}>{nota.observacao}</Text> : null}

                      {podeEditar &&
                        (confirmDeleteId === nota.id ? (
                          <View style={styles.modalActions}>
                            <Text style={styles.menuQuestion}>Excluir esta nota?</Text>
                            <View style={styles.menuRow}>
                              <Pressable onPress={() => setConfirmDeleteId(null)} accessibilityRole="button">
                                <Text style={styles.menuItem}>Cancelar</Text>
                              </Pressable>
                              <Pressable onPress={() => handleDelete(nota.id)} accessibilityRole="button">
                                <Text style={[styles.menuItem, styles.menuItemDanger]}>Excluir</Text>
                              </Pressable>
                            </View>
                          </View>
                        ) : (
                          <View style={[styles.modalActions, styles.menuRow]}>
                            <Pressable onPress={() => startEdit(nota)} accessibilityRole="button">
                              <Text style={styles.menuItem}>Trocar menções</Text>
                            </Pressable>
                            <Pressable onPress={() => setConfirmDeleteId(nota.id)} accessibilityRole="button">
                              <Text style={[styles.menuItem, styles.menuItemDanger]}>Excluir</Text>
                            </Pressable>
                          </View>
                        ))}
                    </>
                  )}
                </View>
              );
            })}

            {errorMessage ? <Text style={styles.formError}>{errorMessage}</Text> : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
