import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import { avisosApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { contentTopStyle, primaryButtonStyles } from '../../styles/common';
import { muralStyles as styles } from '../../styles/screens/mural';

const localStyles = StyleSheet.create({
  searchInput: { flex: 1, color: '#172441', fontSize: 12, paddingVertical: 0 },
  state: {
    marginTop: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  stateText: { color: '#71809B', fontSize: 12, lineHeight: 18 },
  notice: { marginTop: 12, padding: 16, borderRadius: 14, backgroundColor: '#FFFFFF' },
  noticeTitle: { color: '#172441', fontSize: 14, fontWeight: '700' },
  noticeDate: { marginTop: 5, color: '#71809B', fontSize: 11 },
  noticeDescription: { marginTop: 8, color: '#394763', fontSize: 12, lineHeight: 18 },
});

const MAX_IMAGENS = 3;

// opções de expiração: o aviso aparece até o fim do dia calculado
const opcoesExpiracao = [
  { label: 'Não expira', dias: null },
  { label: '1 dia', dias: 1 },
  { label: '3 dias', dias: 3 },
  { label: '1 semana', dias: 7 },
  { label: '2 semanas', dias: 14 },
  { label: '1 mês', dias: 30 },
];

// data no formato do banco (AAAA-MM-DD), no fuso do celular
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daquiA(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return dateKey(data);
}

// "2026-11-30" -> "30/11/2026"
function formatDay(value) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function formatNoticeDate(value) {
  if (!value) return 'Data não informada';
  // o banco grava em UTC, mas devolve sem o fuso ("2026-11-23T17:11:42"); o "Z" faz o celular converter para o horário local
  const date = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

// imagens de um aviso: inteiras (contain), sem cortar nem esticar
// uma imagem ocupa a largura toda; várias ficam lado a lado, com rolagem
function NoticeImages({ imagens }) {
  if (imagens.length === 1) {
    return <Image source={{ uri: imagens[0] }} style={[styles.noticeImage, styles.noticeImageSingle]} resizeMode="contain" />;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.noticeImages}>
      {imagens.map((url) => (
        <Image key={url} source={{ uri: url }} style={styles.noticeImage} resizeMode="contain" />
      ))}
    </ScrollView>
  );
}

export default function MuralScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const user = route.params?.user;
  // professor e gestão publicam avisos; aluno só lê
  const tipoUsuario = String(user?.tipo ?? '').trim().toUpperCase();
  const podePublicar = tipoUsuario === 'PROFESSOR' || tipoUsuario === 'GESTAO';

  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  // qual aviso o cartão azul está mostrando (as setas trocam)
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // formulário de novo aviso (modal)
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [expiraDias, setExpiraDias] = useState(null);
  const [imagens, setImagens] = useState([]); // [{ uri, base64 }] escolhidas na galeria
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // isActive: evita atualizar a tela se o usuário já saiu dela
  async function loadNotices(isActive = () => true) {
    setStatus('loading');
    setErrorMessage('');

    try {
      const { data } = await avisosApi.list();
      if (!Array.isArray(data)) throw new Error('A resposta de avisos está em um formato inválido.');

      // esconde os desativados e os que já expiraram (expira_em é o último dia em que aparece)
      const hoje = dateKey(new Date());
      const activeNotices = data
        .filter((notice) => notice?.ativo !== false && !(notice?.expira_em && notice.expira_em < hoje))
        .sort((first, second) => {
          const firstDate = Date.parse(first?.criado_em ?? '') || 0;
          const secondDate = Date.parse(second?.criado_em ?? '') || 0;
          return secondDate - firstDate;
        });

      if (!isActive()) return;
      setNotices(activeNotices);
      setStatus(activeNotices.length ? 'success' : 'empty');
    } catch (error) {
      if (!isActive()) return;
      setNotices([]);
      setStatus('error');
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar os avisos.'));
    }
  }

  // busca de novo sempre que a tela volta a ficar visível
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadNotices(() => active);
      return () => {
        active = false;
      };
    }, []),
  );

  function openForm() {
    setTitulo('');
    setDescricao('');
    setExpiraDias(null);
    setImagens([]);
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setFormError('');
  }

  async function pickImages() {
    setFormError('');
    const restantes = MAX_IMAGENS - imagens.length;
    if (restantes <= 0) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: restantes,
      quality: 0.6, // comprime para o envio ficar rápido
      base64: true,
    });
    if (resultado.canceled) return;

    const novas = resultado.assets
      .filter((asset) => asset.base64)
      .map((asset) => ({ uri: asset.uri, base64: asset.base64 }));
    if (novas.length < resultado.assets.length) {
      setFormError('Não foi possível ler uma das imagens. Tente escolher de novo.');
    }
    setImagens([...imagens, ...novas].slice(0, MAX_IMAGENS));
  }

  function removeImage(uri) {
    setImagens(imagens.filter((imagem) => imagem.uri !== uri));
  }

  async function handlePublish() {
    if (!titulo.trim() || !descricao.trim()) {
      setFormError('Preencha o título e a descrição.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      // primeiro envia as imagens (uma por vez); a API devolve o link de cada uma
      const urls = [];
      for (const imagem of imagens) {
        const { data } = await avisosApi.uploadImagem({ base64: imagem.base64, tipo: 'image/jpeg' });
        urls.push(data.url);
      }

      await avisosApi.create({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        autor_id: user?.id,
        expira_em: expiraDias ? daquiA(expiraDias) : undefined,
        imagens: urls,
      });
      setShowForm(false);
      setSearch('');
      setFeaturedIndex(0); // o aviso novo é o primeiro da lista
      loadNotices();
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Não foi possível publicar o aviso.'));
    } finally {
      setSaving(false);
    }
  }

  const filteredNotices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    if (!query) return notices;
    return notices.filter((notice) =>
      `${notice.titulo ?? ''} ${notice.descricao ?? ''}`.toLocaleLowerCase('pt-BR').includes(query),
    );
  }, [notices, search]);
  // se a lista diminuir (busca, aviso expirado), não deixa o índice passar do fim
  const featuredPosition = Math.min(featuredIndex, Math.max(filteredNotices.length - 1, 0));
  const featuredNotice = filteredNotices[featuredPosition];
  const temVarios = filteredNotices.length > 1;
  const recentNotices = filteredNotices.slice(1);

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

        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text style={styles.title}>Mural de avisos</Text>
            <Text style={styles.subtitle}>Novidades e comunicados da escola</Text>
          </View>
          {podePublicar && (
            <Pressable
              style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
              onPress={openForm}
              accessibilityRole="button"
              accessibilityLabel="Criar aviso"
            >
              <Ionicons name="add" size={26} color="#FFFFFF" />
            </Pressable>
          )}
        </View>

        <View style={styles.search}>
          <Image source={require('../../../assets/elo-mural-search.png')} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={(texto) => {
              setSearch(texto);
              setFeaturedIndex(0);
            }}
            placeholder="Buscar avisos"
            placeholderTextColor="#AAB5C8"
            style={localStyles.searchInput}
            accessibilityLabel="Buscar avisos por título ou descrição"
          />
        </View>

        {/* cartão azul: um aviso por vez, com imagens e setas para passar pelos outros */}
        <View style={styles.featured}>
          <Image source={require('../../../assets/elo-mural-featured.png')} style={styles.featuredBackground} resizeMode="stretch" />
          <View style={styles.featuredCircle} />
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadgeInline}><Text style={styles.featuredBadgeText}>AVISOS</Text></View>
            {status === 'loading' ? (
              <Text style={styles.featuredHeading}>Carregando avisos...</Text>
            ) : status === 'error' ? (
              <Text style={styles.featuredHeading}>{errorMessage}</Text>
            ) : featuredNotice ? (
              <>
                <Text style={styles.featuredHeading}>{featuredNotice.titulo}</Text>
                <Text style={styles.featuredMeta}>
                  {formatNoticeDate(featuredNotice.criado_em)}
                  {featuredNotice.expira_em ? ` · até ${formatDay(featuredNotice.expira_em)}` : ''}
                </Text>
                <Text style={styles.featuredText}>{featuredNotice.descricao}</Text>

                {featuredNotice.imagens?.length ? (
                  <View style={styles.featuredImages}>
                    <NoticeImages imagens={featuredNotice.imagens} />
                  </View>
                ) : null}

                {temVarios && (
                  <View style={styles.featuredNav}>
                    <Pressable
                      style={[styles.navButton, featuredPosition === 0 && styles.navButtonDisabled]}
                      onPress={() => setFeaturedIndex(featuredPosition - 1)}
                      disabled={featuredPosition === 0}
                      accessibilityRole="button"
                      accessibilityLabel="Aviso anterior"
                    >
                      <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                    </Pressable>
                    <Text style={styles.navCounter}>
                      {featuredPosition + 1} de {filteredNotices.length}
                    </Text>
                    <Pressable
                      style={[styles.navButton, featuredPosition === filteredNotices.length - 1 && styles.navButtonDisabled]}
                      onPress={() => setFeaturedIndex(featuredPosition + 1)}
                      disabled={featuredPosition === filteredNotices.length - 1}
                      accessibilityRole="button"
                      accessibilityLabel="Próximo aviso"
                    >
                      <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.featuredHeading}>
                {status === 'empty' ? 'Nenhum aviso publicado' : 'Nenhum aviso encontrado'}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.recentTitle}>Avisos recentes</Text>
        {status === 'loading' ? (
          <View style={localStyles.state}>
            <ActivityIndicator size="small" color="#3264F5" />
            <Text style={localStyles.stateText}>Carregando avisos...</Text>
          </View>
        ) : status === 'error' ? (
          <View style={localStyles.state}>
            <Text style={localStyles.stateText}>{errorMessage}</Text>
          </View>
        ) : !filteredNotices.length ? (
          <View style={localStyles.state}>
            <Text style={localStyles.stateText}>
              {status === 'empty' ? 'Nenhum aviso ativo foi publicado.' : 'Nenhum aviso corresponde à busca.'}
            </Text>
          </View>
        ) : recentNotices.map((notice) => (
          <View key={notice.id} style={localStyles.notice}>
            {notice.imagens?.length ? (
              <View style={styles.noticeImagesWrap}>
                <NoticeImages imagens={notice.imagens} />
              </View>
            ) : null}
            <Text style={localStyles.noticeTitle}>{notice.titulo}</Text>
            <Text style={localStyles.noticeDate}>
              {formatNoticeDate(notice.criado_em)}
              {notice.expira_em ? ` · até ${formatDay(notice.expira_em)}` : ''}
            </Text>
            <Text style={localStyles.noticeDescription}>{notice.descricao}</Text>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={closeForm}>
        {/* sobe o modal junto com o teclado, para o campo que está sendo digitado ficar visível */}
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.modalDismiss} onPress={closeForm} accessibilityLabel="Fechar" />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo aviso</Text>
              <Pressable onPress={closeForm} hitSlop={10} accessibilityRole="button" accessibilityLabel="Fechar">
                <Ionicons name="close" size={22} color="#71809B" />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Título</Text>
              <TextInput
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ex: Reunião de pais na sexta"
                placeholderTextColor="#AAB5C8"
                maxLength={200}
                style={styles.input}
              />

              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Escreva o comunicado para a escola"
                placeholderTextColor="#AAB5C8"
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.textArea]}
              />

              <Text style={styles.formLabel}>Expiração</Text>
              <View style={styles.chips}>
                {opcoesExpiracao.map((opcao) => {
                  const selected = expiraDias === opcao.dias;
                  return (
                    <Pressable
                      key={opcao.label}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => setExpiraDias(opcao.dias)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opcao.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.formHint}>
                {expiraDias
                  ? `O aviso aparece no mural até ${formatDay(daquiA(expiraDias))}.`
                  : 'O aviso fica no mural até ser removido.'}
              </Text>

              <Text style={styles.formLabel}>Imagens (até {MAX_IMAGENS})</Text>
              <View style={styles.imagePicker}>
                {imagens.map((imagem) => (
                  <View key={imagem.uri} style={styles.thumb}>
                    <Image source={{ uri: imagem.uri }} style={styles.thumbImage} />
                    <Pressable
                      style={styles.thumbRemove}
                      onPress={() => removeImage(imagem.uri)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Remover imagem"
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
                {imagens.length < MAX_IMAGENS && (
                  <Pressable style={styles.addImage} onPress={pickImages} accessibilityRole="button" accessibilityLabel="Adicionar imagem">
                    <Ionicons name="image-outline" size={22} color="#3264F5" />
                    <Text style={styles.addImageText}>Adicionar</Text>
                  </Pressable>
                )}
              </View>

              {formError ? <Text style={styles.formError}>{formError}</Text> : null}

              <Pressable
                style={[primaryButtonStyles.button, styles.publishButton, saving && primaryButtonStyles.disabled]}
                onPress={handlePublish}
                disabled={saving}
                accessibilityRole="button"
                accessibilityState={{ disabled: saving }}
              >
                <Text style={primaryButtonStyles.label}>{saving ? 'Publicando...' : 'Publicar aviso'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <EloTabBar active="Mural" navigation={navigation} variant={route.params?.profile === 'Professor' ? 'professor' : 'student'} />
    </SafeAreaView>
  );
}
