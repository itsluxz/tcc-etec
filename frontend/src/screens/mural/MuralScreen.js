import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/errors';
import { contentTopStyle } from '../../styles/common';
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

function formatNoticeDate(value) {
  if (!value) return 'Data não informada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function MuralScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadNotices() {
        setStatus('loading');
        setErrorMessage('');

        try {
          const { data } = await api.get('/avisos');
          if (!Array.isArray(data)) throw new Error('A resposta de avisos está em um formato inválido.');

          const activeNotices = data
            .filter((notice) => notice?.ativo !== false)
            .sort((first, second) => {
              const firstDate = Date.parse(first?.criado_em ?? '') || 0;
              const secondDate = Date.parse(second?.criado_em ?? '') || 0;
              return secondDate - firstDate;
            });

          if (!active) return;
          setNotices(activeNotices);
          setStatus(activeNotices.length ? 'success' : 'empty');
        } catch (error) {
          if (!active) return;
          setNotices([]);
          setStatus('error');
          setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar os avisos.'));
        }
      }

      loadNotices();
      return () => {
        active = false;
      };
    }, []),
  );

  const filteredNotices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    if (!query) return notices;
    return notices.filter((notice) =>
      `${notice.titulo ?? ''} ${notice.descricao ?? ''}`.toLocaleLowerCase('pt-BR').includes(query),
    );
  }, [notices, search]);
  const featuredNotice = filteredNotices[0];
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

        <Text style={styles.title}>Mural de avisos</Text>
        <Text style={styles.subtitle}>Novidades e comunicados da escola</Text>

        <View style={styles.search}>
          <Image source={require('../../../assets/elo-mural-search.png')} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar avisos"
            placeholderTextColor="#AAB5C8"
            style={localStyles.searchInput}
            accessibilityLabel="Buscar avisos por título ou descrição"
          />
        </View>

        <View style={styles.featured}>
          <Image source={require('../../../assets/elo-mural-featured.png')} style={styles.featuredImage} resizeMode="stretch" />
          <View style={styles.featuredCircle} />
          <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>AVISOS</Text></View>
          {status === 'loading' ? (
            <Text style={styles.featuredTitle}>Carregando avisos...</Text>
          ) : status === 'error' ? (
            <Text style={styles.featuredTitle}>{errorMessage}</Text>
          ) : featuredNotice ? (
            <>
              <Text style={styles.featuredTitle} numberOfLines={2}>{featuredNotice.titulo}</Text>
              <Text style={styles.featuredDate}>{formatNoticeDate(featuredNotice.criado_em)}</Text>
              <Text style={styles.featuredLocation} numberOfLines={3}>{featuredNotice.descricao}</Text>
            </>
          ) : (
            <Text style={styles.featuredTitle}>
              {status === 'empty' ? 'Nenhum aviso publicado' : 'Nenhum aviso encontrado'}
            </Text>
          )}
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
            <Text style={localStyles.noticeTitle}>{notice.titulo}</Text>
            <Text style={localStyles.noticeDate}>{formatNoticeDate(notice.criado_em)}</Text>
            <Text style={localStyles.noticeDescription}>{notice.descricao}</Text>
          </View>
        ))}
      </ScrollView>
      <EloTabBar active="Mural" navigation={navigation} variant={route.params?.profile === 'Professor' ? 'professor' : 'student'} />
    </SafeAreaView>
  );
}
