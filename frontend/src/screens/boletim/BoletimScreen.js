import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';

const ink = '#172441';
const muted = '#71809B';
const blue = '#3264F5';
const border = '#E5EBF3';
const card = '#FFFFFF';
const success = '#16A896';
const warning = '#E08A2C';
const danger = '#D75B5B';
const surface = '#F5F7FC';

const gradeEndpoints = [
  'http://127.0.0.1:8000/boletins',
  'http://127.0.0.1:8000/boletim',
  'http://127.0.0.1:8000/notas',
  'http://127.0.0.1:8000/alunos/notas',
  'http://localhost:8000/boletins',
  'http://localhost:8000/boletim',
  'http://localhost:8000/notas',
  'http://localhost:8000/alunos/notas',
];

function getAcademicStatus(value) {
  const average = Number(value ?? 0);

  if (!Number.isFinite(average) || average === 0) return 'Sem nota';
  if (average >= 6) return 'Aprovado';
  if (average >= 4) return 'Recuperação';
  return 'Reprovado';
}

function getStatusColor(status) {
  if (status === 'Aprovado') return success;
  if (status === 'Recuperação') return warning;
  if (status === 'Reprovado') return danger;
  return muted;
}

function normalizeGradePayload(payload) {
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.results)
        ? payload.results
        : [];

  return rawList.map((item, index) => {
    const grades = Array.isArray(item?.notas)
      ? item.notas
      : Array.isArray(item?.grades)
        ? item.grades
        : Array.isArray(item?.avaliacoes)
          ? item.avaliacoes
          : [];

    const average = Number(
      item?.media_final ??
      item?.media ??
      item?.notaFinal ??
      item?.finalAverage ??
      item?.mediaFinal ??
      0,
    );

    return {
      id: item?.id ?? item?.matricula ?? item?.ra ?? `${index + 1}`,
      studentName: item?.nomeAluno ?? item?.aluno?.nome ?? item?.name ?? item?.nome ?? 'Aluno sem nome',
      studentId: item?.matricula ?? item?.studentId ?? item?.ra ?? item?.codigo ?? '—',
      className: item?.turma ?? item?.className ?? item?.classe ?? '—',
      subject: item?.disciplina ?? item?.subject ?? item?.materia ?? item?.nomeMateria ?? '—',
      period: item?.periodo ?? item?.period ?? item?.bimestre ?? item?.academicPeriod ?? '—',
      grades,
      finalAverage: Number.isFinite(average) ? average : 0,
      academicStatus: item?.status ?? item?.situacao ?? item?.academicStatus ?? getAcademicStatus(average),
    };
  });
}

export default function BoletimScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState('loading');
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('Todos');
  const [selectedSubject, setSelectedSubject] = useState('Todos');
  const [selectedPeriod, setSelectedPeriod] = useState('Todos');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadGrades = async () => {
      setStatus('loading');
      setErrorMessage('');

      try {
        let lastError = null;

        for (const endpoint of gradeEndpoints) {
          try {
            const response = await fetch(endpoint, { method: 'GET' });

            if (!response.ok) {
              lastError = new Error(`Endpoint indisponível: ${endpoint}`);
              continue;
            }

            const payload = await response.json();
            const normalized = normalizeGradePayload(payload);

            if (!active) return;

            if (normalized.length === 0) {
              setRecords([]);
              setStatus('empty');
              return;
            }

            setRecords(normalized);
            setStatus('success');
            return;
          } catch (error) {
            lastError = error;
          }
        }

        if (!active) return;

        setStatus('error');
        setErrorMessage(
          'A API de boletim ainda não está disponível no backend atual. Quando a rota existir, esta tela carregará os dados reais automaticamente.'
        );
        if (lastError) {
          console.warn(lastError);
        }
      } catch (error) {
        if (!active) return;
        setStatus('error');
        setErrorMessage('Não foi possível carregar os dados do boletim.');
      }
    };

    loadGrades();

    return () => {
      active = false;
    };
  }, []);

  const classOptions = useMemo(
    () => ['Todos', ...new Set(records.map((item) => item.className).filter((value) => value && value !== '—'))],
    [records],
  );

  const subjectOptions = useMemo(
    () => ['Todos', ...new Set(records.map((item) => item.subject).filter((value) => value && value !== '—'))],
    [records],
  );

  const periodOptions = useMemo(
    () => ['Todos', ...new Set(records.map((item) => item.period).filter((value) => value && value !== '—'))],
    [records],
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((item) => {
      const matchesSearch =
        !query ||
        item.studentName.toLowerCase().includes(query) ||
        String(item.studentId).toLowerCase().includes(query);

      const matchesClass = selectedClass === 'Todos' || item.className === selectedClass;
      const matchesSubject = selectedSubject === 'Todos' || item.subject === selectedSubject;
      const matchesPeriod = selectedPeriod === 'Todos' || item.period === selectedPeriod;

      return matchesSearch && matchesClass && matchesSubject && matchesPeriod;
    });
  }, [records, search, selectedClass, selectedSubject, selectedPeriod]);

  const averageSummary = records.length
    ? (records.reduce((total, item) => total + Number(item.finalAverage || 0), 0) / records.length).toFixed(1)
    : '0.0';

  const passedCount = records.filter((item) => item.academicStatus === 'Aprovado').length;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(0, 46 - insets.top) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.logoText}>elo</Text>
          </View>
          <View style={styles.notification}>
            <Text style={styles.bell}>🔔</Text>
            <View style={styles.notificationDot} />
          </View>
        </View>

        <Text style={styles.title}>Student Grades</Text>
        <Text style={styles.subtitle}>Consulta de notas e rendimento</Text>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar aluno ou matrícula"
            placeholderTextColor={muted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {status === 'loading' && (
          <View style={styles.stateCard}>
            <ActivityIndicator size="small" color={blue} />
            <Text style={styles.stateText}>Carregando boletins...</Text>
          </View>
        )}

        {status === 'error' && (
          <View style={[styles.stateCard, styles.errorCard]}>
            <Text style={styles.errorTitle}>Dados indisponíveis</Text>
            <Text style={styles.stateText}>{errorMessage}</Text>
          </View>
        )}

        {status === 'empty' && (
          <View style={[styles.stateCard, styles.emptyCard]}>
            <Text style={styles.errorTitle}>Nenhum resultado</Text>
            <Text style={styles.stateText}>Ainda não há registros de notas para exibir.</Text>
          </View>
        )}

        {status === 'success' && (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Média geral</Text>
                <Text style={styles.summaryValue}>{averageSummary}</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Aprovados</Text>
                <Text style={styles.summaryValue}>{passedCount}</Text>
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.sectionLabel}>Turma</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {classOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[styles.filterChip, selectedClass === option && styles.filterChipActive]}
                    onPress={() => setSelectedClass(option)}
                  >
                    <Text style={[styles.filterChipText, selectedClass === option && styles.filterChipTextActive]}>{option}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.sectionLabel}>Disciplina</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {subjectOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[styles.filterChip, selectedSubject === option && styles.filterChipActive]}
                    onPress={() => setSelectedSubject(option)}
                  >
                    <Text style={[styles.filterChipText, selectedSubject === option && styles.filterChipTextActive]}>{option}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.sectionLabel}>Período</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {periodOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[styles.filterChip, selectedPeriod === option && styles.filterChipActive]}
                    onPress={() => setSelectedPeriod(option)}
                  >
                    <Text style={[styles.filterChipText, selectedPeriod === option && styles.filterChipTextActive]}>{option}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.tableCard}>
              {filteredRecords.length === 0 ? (
                <Text style={styles.tableEmpty}>Nenhum aluno encontrado com os filtros selecionados.</Text>
              ) : (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, styles.wideCell]}>Aluno</Text>
                    <Text style={styles.headerCell}>Matrícula</Text>
                    <Text style={styles.headerCell}>Disciplina</Text>
                    <Text style={styles.headerCell}>Notas</Text>
                    <Text style={styles.headerCell}>Média</Text>
                    <Text style={styles.headerCell}>Status</Text>
                  </View>

                  {filteredRecords.map((item) => (
                    <View key={`${item.id}-${item.subject}-${item.period}`} style={styles.tableRow}>
                      <Text style={[styles.cellText, styles.wideCell]}>{item.studentName}</Text>
                      <Text style={styles.cellText}>{item.studentId}</Text>
                      <Text style={styles.cellText}>{item.subject}</Text>
                      <Text style={styles.cellText}>{item.grades.length ? item.grades.join(', ') : '—'}</Text>
                      <Text style={styles.cellText}>{Number(item.finalAverage || 0).toFixed(1)}</Text>
                      <View style={[styles.statusPill, { backgroundColor: `${getStatusColor(item.academicStatus)}20` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.academicStatus) }]}>
                          {item.academicStatus || 'Sem nota'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <EloTabBar active="Boletim" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: surface },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  header: { height: 47, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  brand: { height: 28, flexDirection: 'row', alignItems: 'center' },
  logoText: { color: ink, fontSize: 23, lineHeight: 28, fontWeight: '700' },
  notification: { width: 40, height: 40, marginTop: 7, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  bell: { fontSize: 16 },
  notificationDot: { position: 'absolute', top: 6, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF6877' },
  title: { marginTop: 10, color: ink, fontSize: 23, lineHeight: 28, fontWeight: '700' },
  subtitle: { marginTop: 5, color: muted, fontSize: 12, lineHeight: 15 },
  searchWrap: { height: 42, marginTop: 18, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: border, borderRadius: 11, backgroundColor: '#FFFFFF' },
  searchIcon: { color: muted, fontSize: 18 },
  searchInput: { flex: 1, marginLeft: 9, color: ink, fontSize: 12 },
  summaryRow: { marginTop: 18, flexDirection: 'row', gap: 10 },
  summaryBox: { flex: 1, height: 90, padding: 14, borderWidth: 1, borderColor: border, borderRadius: 18, backgroundColor: card },
  summaryLabel: { color: muted, fontSize: 10, lineHeight: 12, fontWeight: '700' },
  summaryValue: { marginTop: 14, color: ink, fontSize: 22, lineHeight: 26, fontWeight: '700' },
  filterGroup: { marginTop: 18 },
  sectionLabel: { color: ink, fontSize: 12, lineHeight: 15, fontWeight: '700' },
  filterRow: { marginTop: 8, paddingRight: 8, gap: 8 },
  filterChip: { height: 28, paddingHorizontal: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: border },
  filterChipActive: { backgroundColor: '#E8EEFF', borderColor: '#DDE8FF' },
  filterChipText: { color: muted, fontSize: 10, lineHeight: 12, fontWeight: '700' },
  filterChipTextActive: { color: blue },
  stateCard: { marginTop: 18, padding: 22, borderRadius: 18, borderWidth: 1, borderColor: border, backgroundColor: '#FFFFFF', alignItems: 'center' },
  errorCard: { borderColor: '#F9CBCB', backgroundColor: '#FFF7F7' },
  emptyCard: { borderColor: '#E7ECF5', backgroundColor: '#F9FBFF' },
  errorTitle: { color: ink, fontSize: 16, lineHeight: 20, fontWeight: '700' },
  stateText: { marginTop: 8, color: muted, fontSize: 12, lineHeight: 17, textAlign: 'center' },
  tableCard: { marginTop: 18, paddingVertical: 10, borderWidth: 1, borderColor: border, borderRadius: 18, backgroundColor: '#FFFFFF' },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: border },
  headerCell: { flex: 1, color: muted, fontSize: 9, lineHeight: 12, fontWeight: '700' },
  wideCell: { flex: 1.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: border },
  cellText: { flex: 1, color: ink, fontSize: 9.5, lineHeight: 13 },
  statusPill: { flex: 1, paddingVertical: 5, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: 9, lineHeight: 12, fontWeight: '700' },
  tableEmpty: { paddingHorizontal: 14, paddingVertical: 18, color: muted, fontSize: 12, lineHeight: 16, textAlign: 'center' },
});
