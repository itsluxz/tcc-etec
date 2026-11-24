import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import { cardapiosApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { contentTopStyle, primaryButtonStyles } from '../../styles/common';
import { cantinaColors, cantinaStyles as styles, createMenuDotStyle } from '../../styles/screens/cantina';

function parseDate(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMenuDate(date, options) {
  const parsed = parseDate(date);
  return parsed ? new Intl.DateTimeFormat('pt-BR', options).format(parsed) : date;
}

// data no formato do banco (AAAA-MM-DD), no fuso do celular
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// hoje e os próximos 6 dias, para escolher a data do cardápio com um toque
function proximosDias() {
  return Array.from({ length: 7 }, (_, index) => {
    const dia = new Date();
    dia.setDate(dia.getDate() + index);
    return dateKey(dia);
  });
}

export default function CantinaScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const user = route.params?.user;
  // só a gestão cadastra, edita e exclui cardápios
  // confere o tipo vindo da API e também o perfil que o login passa para as abas
  const tipoUsuario = String(user?.tipo ?? '').trim().toUpperCase();
  const podeGerenciar = tipoUsuario === 'GESTAO' || route.params?.profile === 'Gestão';
  const isAluno = tipoUsuario === 'ALUNO' || route.params?.profile === 'Aluno';
  const hoje = dateKey(new Date());

  const [menus, setMenus] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // formulário de novo cardápio / edição (só gestão)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formDate, setFormDate] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // "Comerá hoje?": resposta do aluno (true, false ou null) e contagem para a gestão
  const [vaiComer, setVaiComer] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [respostaStatus, setRespostaStatus] = useState('idle');
  const [respostaError, setRespostaError] = useState('');

  // preferredDate: data para deixar selecionada depois de recarregar (ex: a do cardápio recém-salvo)
  // isActive: evita atualizar a tela se o usuário já saiu dela
  async function loadMenus(preferredDate, isActive = () => true) {
    setStatus('loading');
    setErrorMessage('');

    try {
      const { data } = await cardapiosApi.list();
      if (!Array.isArray(data)) throw new Error('A resposta de cardápios está em um formato inválido.');

      const availableMenus = data
        .filter((item) => typeof item?.data === 'string' && parseDate(item.data))
        .sort((first, second) => first.data.localeCompare(second.data));

      if (!isActive()) return;
      setMenus(availableMenus);
      setSelectedDate((currentDate) => {
        const hasMenu = (date) => availableMenus.some((item) => item.data === date);
        if (preferredDate && hasMenu(preferredDate)) return preferredDate;
        if (hasMenu(currentDate)) return currentDate;
        const todayDate = dateKey(new Date());
        return hasMenu(todayDate) ? todayDate : availableMenus[0]?.data ?? '';
      });
      setStatus(availableMenus.length ? 'success' : 'empty');
    } catch (error) {
      if (!isActive()) return;
      setMenus([]);
      setStatus('error');
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar os cardápios.'));
    }
  }

  // busca de novo sempre que a tela volta a ficar visível
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadMenus(undefined, () => active);
      return () => {
        active = false;
      };
    }, []),
  );

  const selectedMenu = menus.find((item) => item.data === selectedDate);
  const selectedMenuId = selectedMenu?.id;
  // o aluno só responde no cardápio do dia
  const perguntaHoje = isAluno && selectedMenu?.data === hoje;

  // busca a resposta do aluno ou a contagem da gestão sempre que o cardápio selecionado muda
  // (e também quando a lista é recarregada, porque "menus" muda)
  useEffect(() => {
    let active = true;
    setRespostaError('');
    setVaiComer(null);
    setResumo(null);

    async function loadResposta() {
      if (!selectedMenuId || (!perguntaHoje && !podeGerenciar)) {
        setRespostaStatus('idle');
        return;
      }

      setRespostaStatus('loading');
      try {
        if (podeGerenciar) {
          const { data } = await cardapiosApi.resumo(selectedMenuId);
          if (active) setResumo(data);
        } else {
          const { data } = await cardapiosApi.getResposta(selectedMenuId, user.id);
          if (active) setVaiComer(data.vai_comer);
        }
        if (active) setRespostaStatus('success');
      } catch (error) {
        if (!active) return;
        setRespostaStatus('error');
        setRespostaError(getApiErrorMessage(error, 'Não foi possível carregar as respostas.'));
      }
    }

    loadResposta();
    return () => {
      active = false;
    };
  }, [selectedMenuId, perguntaHoje, podeGerenciar, menus]);

  async function handleResponder(resposta) {
    setRespostaStatus('saving');
    setRespostaError('');
    try {
      const { data } = await cardapiosApi.responder(selectedMenuId, user.id, resposta);
      setVaiComer(data.vai_comer);
      setRespostaStatus('success');
    } catch (error) {
      setRespostaStatus('error');
      setRespostaError(getApiErrorMessage(error, 'Não foi possível salvar a resposta.'));
    }
  }

  function openNewForm() {
    setEditingId(null);
    setFormDate(dateKey(new Date()));
    setTitulo('');
    setDescricao('');
    setFormError('');
    setConfirmDelete(false);
    setShowForm(true);
  }

  function openEditForm(menu) {
    setEditingId(menu.id);
    setFormDate(menu.data);
    setTitulo(menu.titulo ?? '');
    setDescricao(menu.descricao ?? '');
    setFormError('');
    setConfirmDelete(false);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormDate('');
    setTitulo('');
    setDescricao('');
    setFormError('');
  }

  async function handleSave() {
    const data = formDate;
    if (!data) {
      setFormError('Escolha o dia do cardápio.');
      return;
    }
    if (!descricao.trim()) {
      setFormError('Preencha a descrição do cardápio.');
      return;
    }
    // a tela mostra um cardápio por data, então não deixa repetir
    if (menus.some((item) => item.data === data && item.id !== editingId)) {
      setFormError('Já existe um cardápio nessa data.');
      return;
    }

    const cardapio = {
      data,
      titulo: titulo.trim() || undefined,
      descricao: descricao.trim(),
    };

    setSaving(true);
    setFormError('');

    try {
      if (editingId) {
        await cardapiosApi.update(editingId, cardapio);
      } else {
        await cardapiosApi.create(cardapio);
      }
      closeForm();
      loadMenus(data);
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Não foi possível salvar o cardápio.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cardapioId) {
    setActionError('');
    try {
      await cardapiosApi.remove(cardapioId);
      setConfirmDelete(false);
      if (editingId === cardapioId) closeForm();
      loadMenus();
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Não foi possível excluir o cardápio.'));
    }
  }

  function selectDate(date) {
    setSelectedDate(date);
    setConfirmDelete(false);
    setActionError('');
  }

  // na edição, se o cardápio for de uma data fora dos 7 dias, ela entra como opção também
  const formDays = proximosDias();
  if (formDate && !formDays.includes(formDate)) {
    formDays.push(formDate);
    formDays.sort();
  }

  const days = menus.slice(0, 5);
  const weekTitle = days.length ? 'Datas cadastradas' : 'Datas disponíveis na API';
  const selectedWeekday = selectedMenu
    ? formatMenuDate(selectedMenu.data, { weekday: 'long' }).toLocaleUpperCase('pt-BR')
    : '';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentTopStyle(insets.top)]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        <Text style={styles.title}>Cardápio</Text>
        <Text style={styles.subtitle}>Cardápios publicados pela escola</Text>

        {podeGerenciar && (
          <Pressable
            style={[primaryButtonStyles.button, styles.newMenuButton]}
            onPress={showForm ? closeForm : openNewForm}
            accessibilityRole="button"
          >
            <Text style={primaryButtonStyles.label}>{showForm ? 'Fechar formulário' : '+ Novo cardápio'}</Text>
          </Pressable>
        )}

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editingId ? 'Editar cardápio' : 'Novo cardápio'}</Text>

            <Text style={styles.formLabel}>Dia</Text>
            <View style={styles.formDays}>
              {formDays.map((dia) => {
                const selected = formDate === dia;
                // dia que já tem outro cardápio cadastrado
                const ocupado = menus.some((item) => item.data === dia && item.id !== editingId);
                return (
                  <Pressable
                    key={dia}
                    style={[styles.formDay, ocupado && styles.formDayBusy, selected && styles.selectedDay]}
                    onPress={() => setFormDate(dia)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={formatMenuDate(dia, { weekday: 'long', day: 'numeric', month: 'long' })}
                  >
                    <Text style={[styles.dayName, selected && styles.selectedDayText]}>
                      {formatMenuDate(dia, { weekday: 'short' }).replace('.', '').toLocaleUpperCase('pt-BR')}
                    </Text>
                    <Text style={[styles.formDayDate, selected && styles.selectedDayText]}>
                      {formatMenuDate(dia, { day: '2-digit' })}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.formHint}>
              {formDate ? formatMenuDate(formDate, { dateStyle: 'full' }) : 'Escolha um dia.'}
            </Text>

            <Text style={styles.formLabel}>Título (opcional)</Text>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ex: Almoço"
              placeholderTextColor={cantinaColors.muted}
              maxLength={50}
              style={styles.input}
            />

            <Text style={styles.formLabel}>Descrição</Text>
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Ex: Arroz, feijão, frango grelhado e salada"
              placeholderTextColor={cantinaColors.muted}
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.textArea]}
            />

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <Pressable
              style={[primaryButtonStyles.button, styles.saveButton, saving && primaryButtonStyles.disabled]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
            >
              <Text style={primaryButtonStyles.label}>
                {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar cardápio'}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>{weekTitle}</Text>
          <Text style={styles.weekArrow}>‹</Text>
        </View>

        <View style={styles.days}>
          {days.map((day) => {
            const selected = day.data === selectedDate;
            return (
              <Pressable
                key={day.id ?? day.data}
                style={[styles.day, selected && styles.selectedDay]}
                onPress={() => selectDate(day.data)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.dayName, selected && styles.selectedDayText]}>
                  {formatMenuDate(day.data, { weekday: 'short' }).replace('.', '').toLocaleUpperCase('pt-BR')}
                </Text>
                <Text style={[styles.dayDate, selected && styles.selectedDayText]}>
                  {formatMenuDate(day.data, { day: '2-digit' })}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.menuCard}>
          {status === 'loading' ? (
            <View style={styles.stateCard}>
              <ActivityIndicator size="small" color={cantinaColors.blue} />
              <Text style={styles.stateText}>Carregando cardápios...</Text>
            </View>
          ) : status === 'error' ? (
            <Text style={styles.stateText}>{errorMessage}</Text>
          ) : status === 'empty' ? (
            <Text style={styles.stateText}>
              {podeGerenciar
                ? 'Nenhum cardápio cadastrado ainda. Toque em "+ Novo cardápio" para cadastrar o primeiro.'
                : 'Nenhum cardápio foi cadastrado na API.'}
            </Text>
          ) : selectedMenu ? (
            <>
              <View style={styles.menuHeading}>
                <View style={styles.mealIconOuter}>
                  <View style={styles.mealIconInner}>
                    <Image source={require('../../../assets/elo-home-meal.png')} style={styles.mealIcon} />
                  </View>
                </View>
                <View style={styles.menuHeadingCopy}>
                  <Text style={styles.weekday}>{selectedWeekday}</Text>
                  <Text style={styles.mealTitle}>{selectedMenu.titulo ?? 'Cardápio'}</Text>
                  <Text style={styles.mealTime}>{formatMenuDate(selectedMenu.data, { dateStyle: 'long' })}</Text>
                </View>
              </View>

              <View style={styles.menuItems}>
                <View style={styles.menuItem}>
                  <View style={[styles.itemDot, createMenuDotStyle(cantinaColors.green)]} />
                  <View style={styles.menuDescription}>
                    <Text style={styles.itemLabel}>DESCRIÇÃO</Text>
                    <Text style={styles.itemValue}>{selectedMenu.descricao}</Text>
                  </View>
                </View>
              </View>

              {perguntaHoje && (
                <View style={styles.answerCard}>
                  <Text style={styles.answerQuestion}>Comerá hoje?</Text>
                  <View style={styles.answerOptions}>
                    {[
                      { valor: true, label: 'Sim' },
                      { valor: false, label: 'Não' },
                    ].map((opcao) => {
                      const selected = vaiComer === opcao.valor;
                      const ocupado = respostaStatus === 'loading' || respostaStatus === 'saving';
                      return (
                        <Pressable
                          key={opcao.label}
                          style={[styles.answerButton, selected && styles.answerButtonSelected, ocupado && primaryButtonStyles.disabled]}
                          onPress={() => handleResponder(opcao.valor)}
                          disabled={ocupado}
                          accessibilityRole="button"
                          accessibilityState={{ selected, disabled: ocupado }}
                        >
                          <Text style={[styles.answerButtonText, selected && styles.answerButtonTextSelected]}>
                            {opcao.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={styles.answerHint}>
                    {respostaStatus === 'loading'
                      ? 'Carregando sua resposta...'
                      : respostaStatus === 'saving'
                        ? 'Salvando...'
                        : vaiComer === true
                          ? 'Você confirmou que vai comer hoje. Pode mudar até o fim do dia.'
                          : vaiComer === false
                            ? 'Você avisou que não vai comer hoje. Pode mudar até o fim do dia.'
                            : 'Sua resposta ajuda a cantina a preparar a quantidade certa.'}
                  </Text>
                  {respostaError ? <Text style={styles.formError}>{respostaError}</Text> : null}
                </View>
              )}

              {podeGerenciar && (
                <View style={styles.answerCard}>
                  <Text style={styles.answerQuestion}>
                    {selectedMenu.data === hoje ? 'Vão comer hoje' : 'Vão comer neste dia'}
                  </Text>
                  {respostaStatus === 'loading' ? (
                    <ActivityIndicator size="small" color={cantinaColors.blue} style={styles.answerLoading} />
                  ) : resumo ? (
                    <>
                      <Text style={styles.answerCount}>
                        {resumo.sim} {resumo.sim === 1 ? 'aluno' : 'alunos'}
                      </Text>
                      <Text style={styles.answerHint}>
                        {`${resumo.nao} ${resumo.nao === 1 ? 'disse' : 'disseram'} que não · ${resumo.total} ${resumo.total === 1 ? 'resposta' : 'respostas'} no total`}
                      </Text>
                    </>
                  ) : null}
                  {respostaError ? <Text style={styles.formError}>{respostaError}</Text> : null}
                </View>
              )}

              {podeGerenciar &&
                (confirmDelete ? (
                  <View style={styles.menuActions}>
                    <Text style={styles.menuQuestion}>Excluir este cardápio?</Text>
                    <Pressable onPress={() => setConfirmDelete(false)} accessibilityRole="button">
                      <Text style={styles.menuAction}>Não</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDelete(selectedMenu.id)} accessibilityRole="button">
                      <Text style={[styles.menuAction, styles.menuActionDanger]}>Sim</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.menuActions}>
                    <Pressable onPress={() => openEditForm(selectedMenu)} accessibilityRole="button">
                      <Text style={styles.menuAction}>Editar</Text>
                    </Pressable>
                    <Pressable onPress={() => setConfirmDelete(true)} accessibilityRole="button">
                      <Text style={[styles.menuAction, styles.menuActionDanger]}>Excluir</Text>
                    </Pressable>
                  </View>
                ))}

              {actionError ? <Text style={styles.formError}>{actionError}</Text> : null}
            </>
          ) : (
            <Text style={styles.stateText}>Não há um cardápio para a data selecionada.</Text>
          )}
        </View>

        <Text style={styles.footnote}>As datas e descrições são carregadas da API da escola.</Text>
      </ScrollView>
      <EloTabBar active="Merenda" navigation={navigation} />
    </SafeAreaView>
  );
}
