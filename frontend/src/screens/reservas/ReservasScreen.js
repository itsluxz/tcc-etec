import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import { reservasApi, salasApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { contentTopStyle, primaryButtonStyles } from '../../styles/common';
import { reservasColors, reservasStyles as styles } from '../../styles/screens/reservas';

const periodos = ['Todos', 'Manhã', 'Tarde', 'Noite'];

// data no formato do banco (AAAA-MM-DD), no fuso do celular
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// hoje e os próximos 6 dias, para escolher a data sem precisar de calendário
function proximosDias() {
  return Array.from({ length: 7 }, (_, index) => {
    const dia = new Date();
    dia.setDate(dia.getDate() + index);
    return {
      key: dateKey(dia),
      label: index === 0 ? 'Hoje' : new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric' }).format(dia),
    };
  });
}

// o banco devolve "08:00:00"; na tela mostramos só "08:00"
function hora(horario) {
  return horario.slice(0, 5);
}

// período em que a reserva começa
function periodoDaReserva(reserva) {
  const inicio = Number(reserva.horario_inicio.slice(0, 2));
  if (inicio < 12) return 'Manhã';
  if (inicio < 18) return 'Tarde';
  return 'Noite';
}

function horaValida(texto) {
  return /^\d{2}:\d{2}$/.test(texto);
}

export default function ReservasScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const user = route.params?.user;
  const podeReservar = user?.tipo === 'PROFESSOR' || user?.tipo === 'GESTAO';
  const dias = proximosDias();

  const [selectedDate, setSelectedDate] = useState(dias[0].key);
  const [period, setPeriod] = useState('Todos');
  const [salas, setSalas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  // formulário de nova reserva (só professor e gestão)
  const [showForm, setShowForm] = useState(false);
  const [salaId, setSalaId] = useState(null);
  const [formDate, setFormDate] = useState(dias[0].key);
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [finalidade, setFinalidade] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function loadDados() {
    setErrorMessage('');
    try {
      const salasResposta = await salasApi.list();
      const reservasResposta = await reservasApi.list({ data: selectedDate });
      setSalas(salasResposta.data);
      setReservas(reservasResposta.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar as reservas.'));
    } finally {
      setLoading(false);
    }
  }

  // busca de novo sempre que o dia escolhido muda
  useEffect(() => {
    loadDados();
  }, [selectedDate]);

  function openForm() {
    setShowForm(true);
    setFormDate(selectedDate);
    setFormError('');
  }

  function closeForm() {
    setShowForm(false);
    setSalaId(null);
    setInicio('');
    setFim('');
    setFinalidade('');
    setFormError('');
  }

  async function handleSave() {
    if (!salaId) {
      setFormError('Escolha uma sala.');
      return;
    }
    if (!horaValida(inicio) || !horaValida(fim)) {
      setFormError('Preencha o início e o fim no formato 08:00.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      await reservasApi.create({
        sala_id: salaId,
        usuario_id: user.id,
        data: formDate,
        horario_inicio: inicio,
        horario_fim: fim,
        finalidade: finalidade.trim() || undefined,
      });
      closeForm();

      // mostra o dia da reserva nova; se já for o dia na tela, só recarrega
      if (formDate === selectedDate) {
        loadDados();
      } else {
        setSelectedDate(formDate);
      }
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Não foi possível salvar a reserva.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(reservaId) {
    setActionError('');
    try {
      await reservasApi.remove(reservaId);
      setConfirmCancelId(null);
      loadDados();
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Não foi possível cancelar a reserva.'));
    }
  }

  const salasDisponiveis = salas.filter((sala) => sala.disponivel);
  const selectedLabel = dias.find((dia) => dia.key === selectedDate)?.label;

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

        <Text style={styles.title}>Reservas</Text>
        <Text style={styles.subtitle}>Laboratórios e salas disponíveis</Text>

        <View style={styles.hero}>
          <Image source={require('../../../assets/elo-reservas-banner.png')} style={styles.heroImage} resizeMode="stretch" />
          <Text style={styles.heroTitle}>Organize sua próxima aula</Text>
          <Text style={styles.heroSubtitle}>Consulte horários e reserve um espaço.</Text>
          {podeReservar && (
            <Pressable style={styles.newReservation} onPress={showForm ? closeForm : openForm} accessibilityRole="button">
              <Text style={styles.newReservationText}>{showForm ? 'Fechar' : 'Nova reserva'}</Text>
            </Pressable>
          )}
        </View>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Sala</Text>
            {salasDisponiveis.length === 0 ? <Text style={styles.formHint}>Nenhuma sala disponível.</Text> : null}
            <View style={styles.options}>
              {salasDisponiveis.map((sala) => (
                <Pressable
                  key={sala.id}
                  style={[styles.period, salaId === sala.id && styles.selectedPeriod]}
                  onPress={() => setSalaId(sala.id)}
                >
                  <Text style={[styles.periodText, salaId === sala.id && styles.selectedPeriodText]}>{sala.nome}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.formLabel}>Dia</Text>
            <View style={styles.options}>
              {dias.map((dia) => (
                <Pressable
                  key={dia.key}
                  style={[styles.period, formDate === dia.key && styles.selectedPeriod]}
                  onPress={() => setFormDate(dia.key)}
                >
                  <Text style={[styles.periodText, formDate === dia.key && styles.selectedPeriodText]}>{dia.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.formLabel}>Início</Text>
                <TextInput
                  value={inicio}
                  onChangeText={setInicio}
                  placeholder="08:00"
                  placeholderTextColor={reservasColors.muted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  style={styles.input}
                />
              </View>
              <View style={styles.timeField}>
                <Text style={styles.formLabel}>Fim</Text>
                <TextInput
                  value={fim}
                  onChangeText={setFim}
                  placeholder="09:40"
                  placeholderTextColor={reservasColors.muted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Finalidade (opcional)</Text>
            <TextInput
              value={finalidade}
              onChangeText={setFinalidade}
              placeholder="Ex: Aula prática de química"
              placeholderTextColor={reservasColors.muted}
              style={styles.input}
            />

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <Pressable
              style={[primaryButtonStyles.button, styles.saveButton, saving && primaryButtonStyles.disabled]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
            >
              <Text style={primaryButtonStyles.label}>{saving ? 'Salvando...' : 'Reservar'}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Disponibilidade</Text>
          <Text style={styles.sectionDate}>{selectedLabel}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periods}>
          {dias.map((dia) => (
            <Pressable
              key={dia.key}
              style={[styles.period, selectedDate === dia.key && styles.selectedPeriod]}
              onPress={() => setSelectedDate(dia.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedDate === dia.key }}
            >
              <Text style={[styles.periodText, selectedDate === dia.key && styles.selectedPeriodText]}>{dia.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.periods}>
          {periodos.map((item) => (
            <Pressable
              key={item}
              style={[styles.period, period === item && styles.selectedPeriod]}
              onPress={() => setPeriod(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: period === item }}
            >
              <Text style={[styles.periodText, period === item && styles.selectedPeriodText]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {actionError ? <Text style={styles.formError}>{actionError}</Text> : null}

        {loading ? (
          <View style={styles.unavailable}>
            <ActivityIndicator color={reservasColors.muted} />
          </View>
        ) : errorMessage ? (
          <View style={styles.unavailable}>
            <Text style={styles.unavailableText}>{errorMessage}</Text>
          </View>
        ) : salas.length === 0 ? (
          <View style={styles.unavailable}>
            <Text style={styles.unavailableText}>Nenhuma sala cadastrada.</Text>
          </View>
        ) : (
          salas.map((sala) => {
            const reservasDaSala = reservas.filter(
              (reserva) => reserva.sala_id === sala.id && (period === 'Todos' || periodoDaReserva(reserva) === period),
            );
            const situacao = !sala.disponivel ? 'Indisponível' : reservasDaSala.length > 0 ? 'Reservada' : 'Livre';

            return (
              <View key={sala.id} style={styles.salaCard}>
                <View style={styles.salaHeader}>
                  <View style={styles.salaTitle}>
                    <Text style={styles.salaName}>{sala.nome}</Text>
                    <Text style={styles.salaType}>{sala.tipo}</Text>
                  </View>
                  <Text style={[styles.tag, situacao === 'Livre' ? styles.tagFree : situacao === 'Reservada' ? styles.tagBusy : styles.tagOff]}>
                    {situacao}
                  </Text>
                </View>

                {reservasDaSala.length === 0 ? (
                  <Text style={styles.salaFree}>
                    {sala.disponivel ? 'Nenhuma reserva nesse período.' : 'Sala fora de uso.'}
                  </Text>
                ) : (
                  reservasDaSala.map((reserva) => (
                    <View key={reserva.id} style={styles.slot}>
                      <Text style={styles.slotTime}>
                        {hora(reserva.horario_inicio)} – {hora(reserva.horario_fim)}
                      </Text>
                      <Text style={styles.slotInfo}>
                        {reserva.usuario?.nome}
                        {reserva.finalidade ? ` · ${reserva.finalidade}` : ''}
                      </Text>

                      {/* só quem reservou pode cancelar */}
                      {reserva.usuario_id === user?.id &&
                        (confirmCancelId === reserva.id ? (
                          <View style={styles.slotActions}>
                            <Text style={styles.slotQuestion}>Cancelar esta reserva?</Text>
                            <Pressable onPress={() => setConfirmCancelId(null)}>
                              <Text style={styles.slotAction}>Não</Text>
                            </Pressable>
                            <Pressable onPress={() => handleCancel(reserva.id)}>
                              <Text style={[styles.slotAction, styles.slotActionDanger]}>Sim</Text>
                            </Pressable>
                          </View>
                        ) : (
                          <Pressable onPress={() => setConfirmCancelId(reserva.id)}>
                            <Text style={[styles.slotAction, styles.slotActionDanger]}>Cancelar</Text>
                          </Pressable>
                        ))}
                    </View>
                  ))
                )}
              </View>
            );
          })
        )}

        <Text style={styles.footnote}>Os horários reservados aparecem no cartão de cada sala.</Text>
      </ScrollView>
      <EloTabBar active="Reservas" navigation={navigation} variant={route.params?.profile === 'Professor' ? 'professor' : 'student'} />
    </SafeAreaView>
  );
}
