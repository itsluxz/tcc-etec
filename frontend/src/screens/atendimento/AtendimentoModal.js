import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { atendimentosApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { primaryButtonStyles } from '../../styles/common';
import { atendimentoColors, atendimentoStyles as styles, statusStyle } from '../../styles/screens/atendimento';
import { ConfirmarExclusao, SolicitacaoForm } from './SolicitacaoEdicao';

// status que a escola pode dar a uma solicitação (o aluno cria como ABERTO)
export const statusAtendimento = [
  { valor: 'ABERTO', label: 'Aberto' },
  { valor: 'EM ANDAMENTO', label: 'Em andamento' },
  { valor: 'RESOLVIDO', label: 'Resolvido' },
];

export function statusLabel(valor) {
  return statusAtendimento.find((item) => item.valor === valor)?.label ?? valor ?? 'Aberto';
}

// o banco grava em UTC, mas devolve sem o fuso ("2026-11-23T17:11:42"); o "Z" faz o celular converter para o horário local
export function formatarData(valor) {
  if (!valor) return '';
  const data = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(valor) ? valor : `${valor}Z`);
  if (Number.isNaN(data.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(data);
}

// modal com as solicitações de um aluno (professor e gestão): ver, responder e trocar o status
// solicitacoes: do aluno, mais recentes primeiro; onChange: recarrega a lista depois de salvar
export default function AtendimentoModal({ visible, title, subtitle, solicitacoes, onClose, onChange }) {
  const [respondendoId, setRespondendoId] = useState(null);
  const [resposta, setResposta] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  function handleClose() {
    setRespondendoId(null);
    setResposta('');
    setEditandoId(null);
    setConfirmDeleteId(null);
    setErrorMessage('');
    onClose();
  }

  // só uma coisa por vez em cada solicitação: responder, editar ou confirmar a exclusão
  function startReply(solicitacao) {
    setRespondendoId(solicitacao.id);
    setResposta(solicitacao.resposta ?? '');
    setEditandoId(null);
    setConfirmDeleteId(null);
    setErrorMessage('');
  }

  function startEdit(solicitacao) {
    setEditandoId(solicitacao.id);
    setRespondendoId(null);
    setConfirmDeleteId(null);
    setErrorMessage('');
  }

  function askDelete(solicitacao) {
    setConfirmDeleteId(solicitacao.id);
    setRespondendoId(null);
    setEditandoId(null);
    setErrorMessage('');
  }

  async function salvar(solicitacaoId, alteracoes, fallback) {
    setSavingId(solicitacaoId);
    setErrorMessage('');
    try {
      await atendimentosApi.update(solicitacaoId, alteracoes);
      setRespondendoId(null);
      setEditandoId(null);
      onChange();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, fallback));
    } finally {
      setSavingId(null);
    }
  }

  // se era a última solicitação do aluno, o cartão dele some e o modal fecha sozinho
  async function excluir(solicitacaoId) {
    setSavingId(solicitacaoId);
    setErrorMessage('');
    try {
      await atendimentosApi.remove(solicitacaoId);
      setConfirmDeleteId(null);
      onChange();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível excluir a solicitação.'));
    } finally {
      setSavingId(null);
    }
  }

  function handleReply(solicitacao) {
    const texto = resposta.trim();
    if (!texto) {
      setErrorMessage('Escreva a resposta antes de enviar.');
      return;
    }
    // responder um pedido ainda aberto já o coloca em andamento
    const alteracoes = { resposta: texto };
    if ((solicitacao.status ?? 'ABERTO') === 'ABERTO') alteracoes.status = 'EM ANDAMENTO';
    salvar(solicitacao.id, alteracoes, 'Não foi possível enviar a resposta.');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      {/* sobe o modal junto com o teclado, para a resposta ficar visível */}
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={styles.modalDismiss} onPress={handleClose} accessibilityLabel="Fechar" />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <View style={styles.cardTitle}>
              <Text style={styles.modalTitle}>{title}</Text>
              {subtitle ? <Text style={styles.cardMeta}>{subtitle}</Text> : null}
            </View>
            <Pressable onPress={handleClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Fechar">
              <Ionicons name="close" size={22} color={atendimentoColors.muted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {solicitacoes.map((solicitacao) => {
              const status = solicitacao.status ?? 'ABERTO';
              const respondendo = respondendoId === solicitacao.id;
              const editando = editandoId === solicitacao.id;
              const saving = savingId === solicitacao.id;

              if (editando) {
                return (
                  <View key={solicitacao.id} style={styles.requestSection}>
                    <Text style={styles.requestSubject}>Editar solicitação</Text>
                    <SolicitacaoForm
                      solicitacao={solicitacao}
                      saving={saving}
                      onSave={(dados) => salvar(solicitacao.id, dados, 'Não foi possível salvar a solicitação.')}
                      onCancel={() => setEditandoId(null)}
                    />
                  </View>
                );
              }

              return (
                <View key={solicitacao.id} style={styles.requestSection}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestSubject}>{solicitacao.assunto || 'Solicitação sem assunto'}</Text>
                    <Text style={[styles.statusPill, statusStyle(status)]}>{statusLabel(status)}</Text>
                  </View>
                  <Text style={styles.requestDate}>{formatarData(solicitacao.criado_em)}</Text>
                  <Text style={styles.requestText}>{solicitacao.descricao}</Text>

                  {respondendo ? (
                    <>
                      <TextInput
                        value={resposta}
                        onChangeText={setResposta}
                        placeholder="Escreva a resposta para o aluno"
                        placeholderTextColor="#AAB5C8"
                        multiline
                        textAlignVertical="top"
                        style={styles.replyInput}
                        autoFocus
                      />
                      <View style={styles.replyButtons}>
                        <Pressable
                          style={[primaryButtonStyles.button, styles.replySend, saving && primaryButtonStyles.disabled]}
                          onPress={() => handleReply(solicitacao)}
                          disabled={saving}
                          accessibilityRole="button"
                          accessibilityState={{ disabled: saving }}
                        >
                          <Text style={primaryButtonStyles.label}>{saving ? 'Enviando...' : 'Enviar resposta'}</Text>
                        </Pressable>
                        <Pressable onPress={() => setRespondendoId(null)} disabled={saving} accessibilityRole="button">
                          <Text style={styles.replyCancel}>Cancelar</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      {solicitacao.resposta ? (
                        <View style={styles.replyBox}>
                          <Text style={styles.replyLabel}>RESPOSTA DA ESCOLA</Text>
                          <Text style={styles.replyText}>{solicitacao.resposta}</Text>
                        </View>
                      ) : null}
                      {confirmDeleteId === solicitacao.id ? (
                        <ConfirmarExclusao
                          deleting={saving}
                          onConfirm={() => excluir(solicitacao.id)}
                          onCancel={() => setConfirmDeleteId(null)}
                        />
                      ) : (
                        <View style={styles.actionsRow}>
                          <Pressable style={styles.requestAction} onPress={() => startReply(solicitacao)} accessibilityRole="button">
                            <Ionicons name="chatbubble-ellipses-outline" size={15} color="#3264F5" />
                            <Text style={styles.requestActionText}>{solicitacao.resposta ? 'Editar resposta' : 'Responder'}</Text>
                          </Pressable>
                          <Pressable style={styles.requestAction} onPress={() => startEdit(solicitacao)} accessibilityRole="button">
                            <Ionicons name="create-outline" size={15} color="#3264F5" />
                            <Text style={styles.requestActionText}>Editar</Text>
                          </Pressable>
                          <Pressable style={styles.requestAction} onPress={() => askDelete(solicitacao)} accessibilityRole="button">
                            <Ionicons name="trash-outline" size={15} color={atendimentoColors.danger} />
                            <Text style={[styles.requestActionText, styles.actionDanger]}>Excluir</Text>
                          </Pressable>
                        </View>
                      )}
                    </>
                  )}

                  <Text style={styles.statusLabel}>Status</Text>
                  <View style={styles.statusOptions}>
                    {statusAtendimento.map((item) => {
                      const ativo = status === item.valor;
                      return (
                        <Pressable
                          key={item.valor}
                          style={[styles.statusOption, ativo && styles.statusOptionActive]}
                          onPress={() => !ativo && salvar(solicitacao.id, { status: item.valor }, 'Não foi possível mudar o status.')}
                          disabled={saving}
                          accessibilityRole="button"
                          accessibilityState={{ selected: ativo }}
                        >
                          <Text style={[styles.statusOptionText, ativo && styles.statusOptionTextActive]}>{item.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {errorMessage ? <Text style={styles.modalError}>{errorMessage}</Text> : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
