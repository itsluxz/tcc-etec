import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import api from '../../services/api';
import { atendimentosApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { contentTopStyle } from '../../styles/common';
import { atendimentoColors, atendimentoStyles as styles, statusStyle } from '../../styles/screens/atendimento';
import AtendimentoModal, { formatarData } from './AtendimentoModal';
import { ConfirmarExclusao, SolicitacaoForm } from './SolicitacaoEdicao';

const localStyles = StyleSheet.create({
  button: {
    minHeight: 40,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3264F5',
  },
  buttonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#E8EEFF' },
  secondaryButtonText: { color: '#3264F5' },
  form: { marginTop: 14, padding: 16, borderRadius: 16, backgroundColor: '#FFFFFF' },
  label: { marginTop: 10, color: '#172441', fontSize: 12, fontWeight: '700' },
  input: {
    minHeight: 42,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E5EBF3',
    borderRadius: 9,
    color: '#172441',
    fontSize: 13,
  },
  descriptionInput: { minHeight: 96, textAlignVertical: 'top' },
  state: { marginTop: 14, padding: 18, borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 16, backgroundColor: '#FFFFFF' },
  stateText: { color: '#71809B', fontSize: 12, lineHeight: 18 },
  ticket: { marginTop: 12, padding: 16, borderWidth: 1, borderColor: '#E5EBF3', borderRadius: 15, backgroundColor: '#FFFFFF' },
  ticketHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  ticketSubject: { flex: 1, color: '#172441', fontSize: 14, fontWeight: '700' },
  ticketStatus: { color: '#3264F5', fontSize: 10, fontWeight: '700' },
  ticketDescription: { marginTop: 8, color: '#394763', fontSize: 12, lineHeight: 18 },
  reply: { marginTop: 10, padding: 11, borderRadius: 10, backgroundColor: '#F2F5FC' },
  replyLabel: { color: '#3264F5', fontSize: 10, fontWeight: '700' },
  replyText: { marginTop: 4, color: '#394763', fontSize: 12, lineHeight: 18 },
  formError: { marginTop: 10, color: '#B42318', fontSize: 12, lineHeight: 17 },
});

function findUser(route, navigation) {
  const parentMain = navigation.getParent()?.getState()?.routes?.find((item) => item.name === 'Main');
  return route.params?.user ?? parentMain?.params?.user ?? null;
}

function findUserId(route, navigation) {
  const id = findUser(route, navigation)?.id;
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function porMaisRecente(primeira, segunda) {
  const dataPrimeira = Date.parse(primeira?.criado_em ?? '') || 0;
  const dataSegunda = Date.parse(segunda?.criado_em ?? '') || 0;
  return dataSegunda - dataPrimeira;
}

// junta as solicitações de alunos por aluno; o aluno que pediu por último vem primeiro
// (Map, e não objeto: num objeto as chaves numéricas ficariam em ordem de id)
function agruparPorAluno(lista) {
  const grupos = new Map();
  [...lista].sort(porMaisRecente).forEach((solicitacao) => {
    if (solicitacao?.usuario?.tipo !== 'ALUNO') return;
    if (!grupos.has(solicitacao.usuario_id)) {
      grupos.set(solicitacao.usuario_id, {
        id: solicitacao.usuario_id,
        nome: solicitacao.usuario.nome,
        turma: solicitacao.usuario.turma,
        solicitacoes: [],
      });
    }
    grupos.get(solicitacao.usuario_id).solicitacoes.push(solicitacao);
  });
  return [...grupos.values()];
}

// "Maria Clara Souza" -> "MC"
function iniciais(nome = '') {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

// não existe campo de curso: o curso é o nome da turma, ex: "Informatica Para Internet · 2026"
function nomeDoCurso(turma) {
  return turma ? `${turma.nome} · ${turma.ano}` : 'Sem turma';
}

export default function AtendimentoScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const variant = route.params?.profile === 'Professor' ? 'professor' : 'student';
  const userId = findUserId(route, navigation);
  const userTipo = String(findUser(route, navigation)?.tipo ?? '').trim().toUpperCase();
  // professor e gestão veem as solicitações dos alunos, um cartão por aluno
  const isStaff = userTipo === 'PROFESSOR' || userTipo === 'GESTAO';
  const activeRef = useRef(false);
  const [alunos, setAlunos] = useState([]);
  const [alunosStatus, setAlunosStatus] = useState('loading');
  const [alunosError, setAlunosError] = useState('');
  const [alunoAbertoId, setAlunoAbertoId] = useState(null);
  // editar / excluir as próprias solicitações (em "Minhas solicitações")
  const [meuEditandoId, setMeuEditandoId] = useState(null);
  const [meuConfirmId, setMeuConfirmId] = useState(null);
  const [meuSavingId, setMeuSavingId] = useState(null);
  const [meuErro, setMeuErro] = useState('');
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      activeRef.current = true;

      async function loadTickets() {
        setStatus('loading');
        setErrorMessage('');

        if (!userId) {
          setTickets([]);
          setStatus('error');
          setErrorMessage('Não foi possível identificar sua conta. Saia e entre novamente para consultar seus atendimentos.');
          return;
        }

        try {
          const { data } = await api.get('/atendimentos', { params: { usuario_id: userId } });
          if (!Array.isArray(data)) throw new Error('A resposta de atendimentos está em um formato inválido.');

          const ownTickets = data
            .filter((ticket) => Number(ticket?.usuario_id) === userId)
            .sort((first, second) => {
              const firstDate = Date.parse(first?.criado_em ?? '') || 0;
              const secondDate = Date.parse(second?.criado_em ?? '') || 0;
              return secondDate - firstDate;
            });

          if (!active) return;
          setTickets(ownTickets);
          setStatus(ownTickets.length ? 'success' : 'empty');
        } catch (error) {
          if (!active) return;
          setTickets([]);
          setStatus('error');
          setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar suas solicitações.'));
        }
      }

      loadTickets();
      if (isStaff) loadAlunos();
      return () => {
        active = false;
        activeRef.current = false;
      };
    }, [reloadKey, userId, isStaff]),
  );

  // professor e gestão: todas as solicitações, agrupadas por aluno
  // (também chamada pelo modal depois de responder ou mudar o status)
  async function loadAlunos() {
    setAlunosError('');
    try {
      const { data } = await atendimentosApi.list();
      if (!Array.isArray(data)) throw new Error('A resposta de atendimentos está em um formato inválido.');
      if (!activeRef.current) return;
      const grupos = agruparPorAluno(data);
      setAlunos(grupos);
      setAlunosStatus(grupos.length ? 'success' : 'empty');
    } catch (error) {
      if (!activeRef.current) return;
      setAlunos([]);
      setAlunosStatus('error');
      setAlunosError(getApiErrorMessage(error, 'Não foi possível carregar as solicitações dos alunos.'));
    }
  }

  // depois de editar ou excluir, recarrega a própria lista (reloadKey) e, se for da equipe,
  // a dos alunos também (a solicitação pode aparecer nas duas)
  async function salvarMinha(solicitacaoId, dados) {
    setMeuSavingId(solicitacaoId);
    setMeuErro('');
    try {
      await atendimentosApi.update(solicitacaoId, dados);
      if (!activeRef.current) return;
      setMeuEditandoId(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      if (activeRef.current) setMeuErro(getApiErrorMessage(error, 'Não foi possível salvar a solicitação.'));
    } finally {
      if (activeRef.current) setMeuSavingId(null);
    }
  }

  async function excluirMinha(solicitacaoId) {
    setMeuSavingId(solicitacaoId);
    setMeuErro('');
    try {
      await atendimentosApi.remove(solicitacaoId);
      if (!activeRef.current) return;
      setMeuConfirmId(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      if (activeRef.current) setMeuErro(getApiErrorMessage(error, 'Não foi possível excluir a solicitação.'));
    } finally {
      if (activeRef.current) setMeuSavingId(null);
    }
  }

  // o modal lê do estado atual, então mostra a resposta e o status já atualizados
  const alunoAberto = alunos.find((aluno) => aluno.id === alunoAbertoId) ?? null;

  async function createTicket() {
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setFormError('Descreva sua solicitação antes de enviar.');
      return;
    }
    if (!userId) {
      setFormError('Não foi possível identificar sua conta. Entre novamente.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/atendimentos', {
        usuario_id: userId,
        assunto: subject.trim() || null,
        descricao: trimmedDescription,
      });

      if (!activeRef.current) return;
      setSubject('');
      setDescription('');
      setShowForm(false);
      setReloadKey((current) => current + 1);
    } catch (error) {
      if (activeRef.current) {
        setFormError(getApiErrorMessage(error, 'Não foi possível enviar sua solicitação.'));
      }
    } finally {
      if (activeRef.current) setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentTopStyle(insets.top)]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={require('../../../assets/elo-home-logo-mark.png')} style={styles.logoMark} />
            <Image source={require('../../../assets/elo-home-logo-eye.png')} style={styles.logoEye} />
            <Text style={styles.logoText}>elo</Text>
          </View>
          <View style={styles.notification}>
            <Image source={require('../../../assets/elo-home-bell.png')} style={styles.bell} />
            <View style={styles.notificationDot} />
          </View>
        </View>

        <Text style={styles.title}>Atendimento</Text>
        <Text style={styles.subtitle}>Dúvidas e solicitações</Text>

        <View style={styles.hero}>
          <Image source={require('../../../assets/elo-help-banner.png')} style={styles.heroImage} resizeMode="stretch" />
          <View style={styles.heroCircle} />
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>ESTAMOS AQUI</Text></View>
          <Text style={styles.heroTitle}>Como podemos ajudar?</Text>
          <Text style={styles.heroSubtitle}>Fale com a escola sem sair do app.</Text>
          <Pressable
            style={styles.heroButton}
            onPress={() => {
              setShowForm((current) => !current);
              setFormError('');
            }}
            accessibilityRole="button"
          >
            <Text style={styles.heroButtonText}>Nova solicitação</Text>
          </Pressable>
        </View>

        {showForm && (
          <View style={localStyles.form}>
            <Text style={styles.sectionTitle}>Nova solicitação</Text>
            <Text style={localStyles.label}>Assunto (opcional)</Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              maxLength={200}
              placeholder="Ex.: Dúvida sobre horário"
              placeholderTextColor="#AAB5C8"
              style={localStyles.input}
            />
            <Text style={localStyles.label}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Conte como a escola pode ajudar"
              placeholderTextColor="#AAB5C8"
              style={[localStyles.input, localStyles.descriptionInput]}
              textAlignVertical="top"
            />
            {formError ? <Text style={localStyles.formError}>{formError}</Text> : null}
            <Pressable
              style={[localStyles.button, submitting && { opacity: 0.6 }]}
              onPress={createTicket}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting }}
            >
              <Text style={localStyles.buttonText}>{submitting ? 'Enviando...' : 'Enviar solicitação'}</Text>
            </Pressable>
            <Pressable
              style={[localStyles.button, localStyles.secondaryButton]}
              onPress={() => setShowForm(false)}
              disabled={submitting}
              accessibilityRole="button"
            >
              <Text style={[localStyles.buttonText, localStyles.secondaryButtonText]}>Cancelar</Text>
            </Pressable>
          </View>
        )}

        {isStaff && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Solicitações dos alunos</Text>
              <View style={styles.openBadge}>
                <Text style={styles.openBadgeText}>
                  {alunosStatus === 'loading' ? 'Carregando' : `${alunos.length} ${alunos.length === 1 ? 'aluno' : 'alunos'}`}
                </Text>
              </View>
            </View>

            {alunosStatus === 'loading' ? (
              <View style={localStyles.state}>
                <ActivityIndicator size="small" color="#3264F5" />
              </View>
            ) : alunosStatus === 'error' ? (
              <View style={localStyles.state}><Text style={localStyles.stateText}>{alunosError}</Text></View>
            ) : alunosStatus === 'empty' ? (
              <View style={localStyles.state}>
                <Text style={localStyles.stateText}>Nenhum aluno enviou solicitações ainda.</Text>
              </View>
            ) : alunos.map((aluno) => {
              const total = aluno.solicitacoes.length;
              const pendentes = aluno.solicitacoes.filter((item) => (item.status ?? 'ABERTO') !== 'RESOLVIDO').length;

              return (
                <Pressable
                  key={aluno.id}
                  style={({ pressed }) => [styles.studentCard, pressed && styles.cardPressed]}
                  onPress={() => setAlunoAbertoId(aluno.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir solicitações de ${aluno.nome}`}
                >
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentInitials}>{iniciais(aluno.nome)}</Text>
                  </View>
                  <View style={styles.cardTitle}>
                    <Text style={styles.cardName}>{aluno.nome}</Text>
                    <Text style={styles.cardMeta}>{nomeDoCurso(aluno.turma)}</Text>
                    <Text style={styles.cardMeta}>
                      {total} {total === 1 ? 'solicitação' : 'solicitações'} · última em {formatarData(aluno.solicitacoes[0].criado_em)}
                    </Text>
                  </View>
                  <Text style={[styles.statusPill, statusStyle(pendentes ? 'ABERTO' : 'RESOLVIDO')]}>
                    {pendentes ? `${pendentes} ${pendentes === 1 ? 'pendente' : 'pendentes'}` : 'Resolvidas'}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={atendimentoColors.muted} />
                </Pressable>
              );
            })}
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minhas solicitações</Text>
          <View style={styles.openBadge}>
            <Text style={styles.openBadgeText}>{status === 'loading' ? 'Carregando' : `${tickets.length} solicitações`}</Text>
          </View>
        </View>

        {status === 'loading' ? (
          <View style={localStyles.state}>
            <ActivityIndicator size="small" color="#3264F5" />
            <Text style={[localStyles.stateText, { marginTop: 8 }]}>Carregando suas solicitações...</Text>
          </View>
        ) : status === 'error' ? (
          <View style={localStyles.state}><Text style={localStyles.stateText}>{errorMessage}</Text></View>
        ) : status === 'empty' ? (
          <View style={localStyles.state}>
            <Text style={localStyles.stateText}>Você ainda não enviou solicitações.</Text>
          </View>
        ) : tickets.map((ticket) => (
          <View key={ticket.id} style={localStyles.ticket}>
            {meuEditandoId === ticket.id ? (
              <>
                <Text style={localStyles.ticketSubject}>Editar solicitação</Text>
                <SolicitacaoForm
                  solicitacao={ticket}
                  saving={meuSavingId === ticket.id}
                  onSave={(dados) => salvarMinha(ticket.id, dados)}
                  onCancel={() => setMeuEditandoId(null)}
                />
              </>
            ) : (
              <>
                <View style={localStyles.ticketHeading}>
                  <Text style={localStyles.ticketSubject}>{ticket.assunto || 'Solicitação sem assunto'}</Text>
                  <Text style={localStyles.ticketStatus}>{ticket.status || 'ABERTO'}</Text>
                </View>
                <Text style={localStyles.ticketDescription}>{ticket.descricao}</Text>
                {ticket.resposta ? (
                  <View style={localStyles.reply}>
                    <Text style={localStyles.replyLabel}>RESPOSTA DA ESCOLA</Text>
                    <Text style={localStyles.replyText}>{ticket.resposta}</Text>
                  </View>
                ) : null}

                {meuConfirmId === ticket.id ? (
                  <ConfirmarExclusao
                    deleting={meuSavingId === ticket.id}
                    onConfirm={() => excluirMinha(ticket.id)}
                    onCancel={() => setMeuConfirmId(null)}
                  />
                ) : (
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.requestAction}
                      onPress={() => {
                        setMeuEditandoId(ticket.id);
                        setMeuConfirmId(null);
                        setMeuErro('');
                      }}
                      accessibilityRole="button"
                    >
                      <Ionicons name="create-outline" size={15} color="#3264F5" />
                      <Text style={styles.requestActionText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.requestAction}
                      onPress={() => {
                        setMeuConfirmId(ticket.id);
                        setMeuEditandoId(null);
                        setMeuErro('');
                      }}
                      accessibilityRole="button"
                    >
                      <Ionicons name="trash-outline" size={15} color={atendimentoColors.danger} />
                      <Text style={[styles.requestActionText, styles.actionDanger]}>Excluir</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}
            {meuErro && (meuEditandoId === ticket.id || meuConfirmId === ticket.id) ? (
              <Text style={localStyles.formError}>{meuErro}</Text>
            ) : null}
          </View>
        ))}
      </ScrollView>

      {isStaff && (
        <AtendimentoModal
          visible={Boolean(alunoAberto)}
          title={alunoAberto?.nome}
          subtitle={alunoAberto ? nomeDoCurso(alunoAberto.turma) : ''}
          solicitacoes={alunoAberto?.solicitacoes ?? []}
          onClose={() => setAlunoAbertoId(null)}
          onChange={loadAlunos}
        />
      )}

      <EloTabBar active="Ajuda" navigation={navigation} variant={variant} />
    </SafeAreaView>
  );
}
