import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { primaryButtonStyles } from '../../styles/common';
import { atendimentoStyles as styles } from '../../styles/screens/atendimento';

// formulário para editar o assunto e a descrição de uma solicitação
// usado no modal do aluno (professor e gestão) e em "Minhas solicitações"
// onSave recebe { assunto, descricao } já prontos para o PUT /atendimentos/{id}
export function SolicitacaoForm({ solicitacao, saving, onSave, onCancel }) {
  const [assunto, setAssunto] = useState(solicitacao.assunto ?? '');
  const [descricao, setDescricao] = useState(solicitacao.descricao ?? '');
  const [erro, setErro] = useState('');

  function handleSave() {
    if (!descricao.trim()) {
      setErro('A descrição não pode ficar vazia.');
      return;
    }
    setErro('');
    // assunto vazio vira null: a solicitação fica "sem assunto"
    onSave({ assunto: assunto.trim() || null, descricao: descricao.trim() });
  }

  return (
    <View>
      <Text style={styles.editLabel}>Assunto (opcional)</Text>
      <TextInput
        value={assunto}
        onChangeText={setAssunto}
        maxLength={200}
        placeholder="Ex.: Dúvida sobre horário"
        placeholderTextColor="#AAB5C8"
        style={styles.editInput}
      />
      <Text style={styles.editLabel}>Descrição</Text>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        multiline
        textAlignVertical="top"
        placeholder="Conte como a escola pode ajudar"
        placeholderTextColor="#AAB5C8"
        style={[styles.editInput, styles.replyInput]}
      />
      {erro ? <Text style={styles.modalError}>{erro}</Text> : null}
      <View style={styles.replyButtons}>
        <Pressable
          style={[primaryButtonStyles.button, styles.replySend, saving && primaryButtonStyles.disabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityState={{ disabled: saving }}
        >
          <Text style={primaryButtonStyles.label}>{saving ? 'Salvando...' : 'Salvar'}</Text>
        </Pressable>
        <Pressable onPress={onCancel} disabled={saving} accessibilityRole="button">
          <Text style={styles.replyCancel}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

// "Excluir esta solicitação?" com Cancelar / Excluir, no próprio cartão
// (os botões do Alert não funcionam quando o app roda no navegador)
export function ConfirmarExclusao({ deleting, onConfirm, onCancel }) {
  return (
    <View style={styles.confirmBox}>
      <Text style={styles.confirmQuestion}>Excluir esta solicitação?</Text>
      <View style={styles.actionsRow}>
        <Pressable onPress={onCancel} disabled={deleting} accessibilityRole="button">
          <Text style={styles.requestActionText}>Cancelar</Text>
        </Pressable>
        <Pressable onPress={onConfirm} disabled={deleting} accessibilityRole="button">
          <Text style={[styles.requestActionText, styles.actionDanger]}>{deleting ? 'Excluindo...' : 'Excluir'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
