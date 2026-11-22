import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/errors';
import { contentTopStyle } from '../../styles/common';
import { atendimentoStyles as styles } from '../../styles/screens/atendimento';

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

function findUserId(route, navigation) {
  const parentMain = navigation.getParent()?.getState()?.routes?.find((item) => item.name === 'Main');
  const id = route.params?.user?.id ?? parentMain?.params?.user?.id;
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export default function AtendimentoScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const variant = route.params?.profile === 'Professor' ? 'professor' : 'student';
  const userId = findUserId(route, navigation);
  const activeRef = useRef(false);
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
      return () => {
        active = false;
        activeRef.current = false;
      };
    }, [reloadKey, userId]),
  );

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
          </View>
        ))}
      </ScrollView>
      <EloTabBar active="Ajuda" navigation={navigation} variant={variant} />
    </SafeAreaView>
  );
}
