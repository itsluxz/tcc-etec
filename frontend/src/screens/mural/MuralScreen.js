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
import { colors } from '../../styles/global';
import { muralStyles as styles } from '../../styles/screens/mural';
import { avisosAtivos } from './avisosAtivos';

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
  // só a gestão edita e exclui avisos
  const podeGerenciar = tipoUsuario === 'GESTAO';

  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  // qual aviso o cartão azul está mostrando (as setas trocam)
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // formulário de novo aviso ou de edição (modal)
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null); // aviso sendo editado; null = aviso novo
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  // número de dias, null ("não expira") ou 'manter' (edição: mantém a data atual)
  const [expiraDias, setExpiraDias] = useState(null);
  // [{ uri, base64 }]: as escolhidas na galeria têm base64; as que já estão no aviso só têm o link (uri)
  const [imagens, setImagens] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // exclusão (gestão): confirmação no próprio cartão, porque os botões do Alert não funcionam no navegador
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState('');

  // isActive: evita atualizar a tela se o usuário já saiu dela
  async function loadNotices(isActive = () => true) {
    setStatus('loading');
    setErrorMessage('');

    try {
      const { data } = await avisosApi.list();
      if (!Array.isArray(data)) throw new Error('A resposta de avisos está em um formato inválido.');

      const activeNotices = avisosAtivos(data);

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

  // sem aviso: formulário vazio para um aviso novo; com aviso: preenchido para editar
  function openForm(notice = null) {
    setEditingNotice(notice);
    setTitulo(notice?.titulo ?? '');
    setDescricao(notice?.descricao ?? '');
    setExpiraDias(notice?.expira_em ? 'manter' : null);
    setImagens((notice?.imagens ?? []).map((url) => ({ uri: url })));
    setFormError('');
    setConfirmDeleteId(null);
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
      // primeiro envia as imagens novas (uma por vez); a API devolve o link de cada uma
      const urls = [];
      for (const imagem of imagens) {
        if (!imagem.base64) {
          urls.push(imagem.uri); // já estava no aviso
          continue;
        }
        const { data } = await avisosApi.uploadImagem({ base64: imagem.base64, tipo: 'image/jpeg' });
        urls.push(data.url);
      }

      const aviso = { titulo: titulo.trim(), descricao: descricao.trim(), imagens: urls };

      if (editingNotice) {
        // 'manter' não manda a data; null tira a expiração
        if (expiraDias !== 'manter') aviso.expira_em = expiraDias ? daquiA(expiraDias) : null;
        await avisosApi.update(editingNotice.id, aviso);
      } else {
        await avisosApi.create({
          ...aviso,
          autor_id: user?.id,
          expira_em: expiraDias ? daquiA(expiraDias) : undefined,
        });
        setSearch('');
        setFeaturedIndex(0); // o aviso novo é o primeiro da lista
      }

      setShowForm(false);
      loadNotices();
    } catch (error) {
      const fallback = editingNotice ? 'Não foi possível salvar o aviso.' : 'Não foi possível publicar o aviso.';
      setFormError(getApiErrorMessage(error, fallback));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(avisoId) {
    setDeletingId(avisoId);
    setActionError('');
    try {
      await avisosApi.remove(avisoId);
      setConfirmDeleteId(null);
      loadNotices();
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Não foi possível excluir o aviso.'));
    } finally {
      setDeletingId(null);
    }
  }

  // botões Editar / Excluir de um aviso (só gestão); light = versão branca para o cartão azul
  function renderActions(notice, light = false) {
    if (!podeGerenciar) return null;

    if (confirmDeleteId === notice.id) {
      const deleting = deletingId === notice.id;
      return (
        <View style={styles.noticeActions}>
          <Text style={[styles.noticeQuestion, light && styles.noticeTextLight]}>Excluir este aviso?</Text>
          <Pressable
            style={[styles.noticeButton, light && styles.noticeButtonLight]}
            onPress={() => setConfirmDeleteId(null)}
            disabled={deleting}
            accessibilityRole="button"
          >
            <Text style={[styles.noticeButtonText, light && styles.noticeTextLight]}>Não</Text>
          </Pressable>
          <Pressable
            style={[styles.noticeButton, styles.noticeButtonDanger, deleting && styles.navButtonDisabled]}
            onPress={() => handleDelete(notice.id)}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel="Confirmar exclusão do aviso"
          >
            <Text style={[styles.noticeButtonText, styles.noticeTextLight]}>{deleting ? 'Excluindo...' : 'Sim, excluir'}</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.noticeActions}>
        <Pressable
          style={[styles.noticeButton, light && styles.noticeButtonLight]}
          onPress={() => openForm(notice)}
          accessibilityRole="button"
          accessibilityLabel={`Editar aviso ${notice.titulo}`}
        >
          <Ionicons name="create-outline" size={15} color={light ? '#FFFFFF' : '#3264F5'} />
          <Text style={[styles.noticeButtonText, light && styles.noticeTextLight]}>Editar</Text>
        </Pressable>
        <Pressable
          style={[styles.noticeButton, light && styles.noticeButtonLight]}
          onPress={() => {
            setActionError('');
            setConfirmDeleteId(notice.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Excluir aviso ${notice.titulo}`}
        >
          <Ionicons name="trash-outline" size={15} color={light ? '#FFFFFF' : colors.danger} />
          <Text style={[styles.noticeButtonText, light ? styles.noticeTextLight : styles.noticeTextDanger]}>Excluir</Text>
        </Pressable>
      </View>
    );
  }

  // na edição de um aviso com data, a primeira opção mantém a data atual
  const opcoesDoFormulario = editingNotice?.expira_em
    ? [{ label: `Manter (até ${formatDay(editingNotice.expira_em)})`, dias: 'manter' }, ...opcoesExpiracao]
    : opcoesExpiracao;

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
              onPress={() => openForm()}
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

                {renderActions(featuredNotice, true)}

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

        {actionError ? <Text style={styles.formError}>{actionError}</Text> : null}

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
            {renderActions(notice)}
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
              <Text style={styles.modalTitle}>{editingNotice ? 'Editar aviso' : 'Novo aviso'}</Text>
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
                {opcoesDoFormulario.map((opcao) => {
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
                {expiraDias === 'manter'
                  ? `O aviso aparece no mural até ${formatDay(editingNotice.expira_em)}.`
                  : expiraDias
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
                <Text style={primaryButtonStyles.label}>
                  {editingNotice
                    ? saving ? 'Salvando...' : 'Salvar alterações'
                    : saving ? 'Publicando...' : 'Publicar aviso'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <EloTabBar active="Mural" navigation={navigation} variant={route.params?.profile === 'Professor' ? 'professor' : 'student'} />
    </SafeAreaView>
  );
}
