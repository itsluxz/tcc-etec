import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import { disciplinasApi, notasApi, turmasApi, usuariosApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { contentTopStyle, primaryButtonStyles } from '../../styles/common';
import { boletimColors, createMencaoStyle, boletimStyles as styles } from '../../styles/screens/boletim';
import MencaoOptions, { tiposMencao } from './MencaoOptions';
import NotaCard from './NotaCard';

const bimestres = [1, 2, 3, 4];

// a API devolve uma nota por bimestre; aqui juntamos as notas do mesmo aluno
// na mesma disciplina numa linha só, com as menções separadas por bimestre
function agruparPorDisciplina(notas) {
  const linhas = {};

  notas.forEach((nota) => {
    const chave = `${nota.aluno_id}-${nota.disciplina_id}`;
    if (!linhas[chave]) {
      linhas[chave] = {
        chave,
        disciplina: nota.disciplina?.nome,
        aluno: nota.aluno?.nome,
        turma: nota.turma?.nome,
        mencoes: {},
      };
    }
    linhas[chave].mencoes[nota.bimestre] = nota.mencao_final;
  });

  return Object.values(linhas);
}

export default function BoletimScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const user = route.params?.user;
  const isAluno = user?.tipo === 'ALUNO';
  const isProfessor = user?.tipo === 'PROFESSOR';

  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');

  // formulário de nova nota (só professor e gestão)
  const [showForm, setShowForm] = useState(false);
  const [turmas, setTurmas] = useState([]);
  const [turmaId, setTurmaId] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [alunoIds, setAlunoIds] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinaId, setDisciplinaId] = useState(null);
  const [bimestre, setBimestre] = useState(null);
  const [mencoesForm, setMencoesForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function loadNotas() {
    setErrorMessage('');
    try {
      // aluno vê só o boletim dele; professor vê as notas que lançou; gestão vê todas
      const filtros = isAluno ? { aluno_id: user.id } : isProfessor ? { professor_id: user.id } : {};
      const { data } = await notasApi.list(filtros);
      setNotas(data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar o boletim.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotas();
  }, []);

  async function openForm() {
    setShowForm(true);
    setFormError('');
    try {
      const { data } = await turmasApi.list();
      setTurmas(data);

      // professor só vê as disciplinas que dá aula; gestão vê todas
      const resposta = await disciplinasApi.list(isProfessor ? { professor_id: user.id } : {});
      setDisciplinas(resposta.data);
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Não foi possível carregar o formulário.'));
    }
  }

  // ao escolher a turma, busca só os alunos dela
  async function selectTurma(id) {
    setTurmaId(id);
    setAlunoIds([]);
    setAlunos([]);
    setFormError('');
    try {
      const { data } = await usuariosApi.list({ tipo: 'ALUNO', turma_id: id });
      setAlunos(data);
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Não foi possível carregar os alunos.'));
    }
  }

  // marca ou desmarca o aluno (dá para escolher vários)
  function toggleAluno(id) {
    if (alunoIds.includes(id)) {
      setAlunoIds(alunoIds.filter((item) => item !== id));
    } else {
      setAlunoIds([...alunoIds, id]);
    }
  }

  function closeForm() {
    setShowForm(false);
    setTurmaId(null);
    setAlunos([]);
    setAlunoIds([]);
    setDisciplinaId(null);
    setBimestre(null);
    setMencoesForm({});
    setFormError('');
  }

  async function handleSave() {
    const faltaMencao = tiposMencao.some((tipo) => !mencoesForm[tipo.campo]);

    if (!turmaId || alunoIds.length === 0 || !disciplinaId || !bimestre || faltaMencao) {
      setFormError('Preencha todos os campos.');
      return;
    }

    setSaving(true);
    setFormError('');

    // a API recebe uma nota por vez, então salva um aluno de cada vez
    const erros = [];
    const alunosComErro = [];

    for (const alunoId of alunoIds) {
      try {
        await notasApi.create({
          aluno_id: alunoId,
          professor_id: user.id,
          turma_id: turmaId,
          disciplina_id: disciplinaId,
          bimestre,
          ...mencoesForm, // mencao_trabalho, mencao_atividades e mencao_prova
        });
      } catch (error) {
        const aluno = alunos.find((item) => item.id === alunoId);
        erros.push(`${aluno?.nome}: ${getApiErrorMessage(error, 'não foi possível salvar a nota.')}`);
        alunosComErro.push(alunoId);
      }
    }

    setSaving(false);
    loadNotas();

    if (erros.length === 0) {
      closeForm();
    } else {
      // deixa marcados só os alunos que deram erro, para tentar de novo
      setAlunoIds(alunosComErro);
      setFormError(erros.join('\n'));
    }
  }

  const query = search.trim().toLowerCase();

  // professor: um cartão por nota (com editar e excluir)
  const notasFiltradas = notas.filter((nota) =>
    `${nota.disciplina?.nome} ${nota.aluno?.nome}`.toLowerCase().includes(query),
  );

  // aluno e gestão: um cartão por disciplina, com a menção final de cada bimestre
  const linhas = agruparPorDisciplina(notas).filter((linha) =>
    `${linha.disciplina} ${linha.aluno ?? ''}`.toLowerCase().includes(query),
  );

  const nenhumaNota = isProfessor ? notasFiltradas.length === 0 : linhas.length === 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentTopStyle(insets.top)]}
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

        <Text style={styles.title}>Boletim</Text>
        <Text style={styles.subtitle}>{isProfessor ? 'Notas que você lançou' : 'Menções finais por bimestre'}</Text>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={isAluno ? 'Buscar disciplina' : 'Buscar aluno ou disciplina'}
            placeholderTextColor={boletimColors.muted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text style={styles.legend}>I Insatisfatório · R Regular · B Bom · MB Muito Bom</Text>

        {!isAluno && (
          <Pressable
            style={[primaryButtonStyles.button, styles.addButton]}
            onPress={showForm ? closeForm : openForm}
            accessibilityRole="button"
          >
            <Text style={primaryButtonStyles.label}>{showForm ? 'Cancelar' : '+ Adicionar nota'}</Text>
          </Pressable>
        )}

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Turma</Text>
            <View style={styles.options}>
              {turmas.map((turma) => (
                <Pressable
                  key={turma.id}
                  style={[styles.option, turmaId === turma.id && styles.optionActive]}
                  onPress={() => selectTurma(turma.id)}
                >
                  <Text style={[styles.optionText, turmaId === turma.id && styles.optionTextActive]}>
                    {turma.nome} ({turma.ano})
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.formLabel}>Alunos</Text>
            {!turmaId ? (
              <Text style={styles.formHint}>Escolha uma turma primeiro.</Text>
            ) : alunos.length === 0 ? (
              <Text style={styles.formHint}>Nenhum aluno nessa turma.</Text>
            ) : null}
            <View style={styles.options}>
              {alunos.map((aluno) => (
                <Pressable
                  key={aluno.id}
                  style={[styles.option, alunoIds.includes(aluno.id) && styles.optionActive]}
                  onPress={() => toggleAluno(aluno.id)}
                >
                  <Text style={[styles.optionText, alunoIds.includes(aluno.id) && styles.optionTextActive]}>{aluno.nome}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.formLabel}>Disciplina</Text>
            {disciplinas.length === 0 ? <Text style={styles.formHint}>Nenhuma disciplina cadastrada para você.</Text> : null}
            <View style={styles.options}>
              {disciplinas.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.option, disciplinaId === item.id && styles.optionActive]}
                  onPress={() => setDisciplinaId(item.id)}
                >
                  <Text style={[styles.optionText, disciplinaId === item.id && styles.optionTextActive]}>{item.nome}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.formLabel}>Bimestre</Text>
            <View style={styles.options}>
              {bimestres.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.option, bimestre === item && styles.optionActive]}
                  onPress={() => setBimestre(item)}
                >
                  <Text style={[styles.optionText, bimestre === item && styles.optionTextActive]}>{item}º bim</Text>
                </Pressable>
              ))}
            </View>

            {tiposMencao.map((tipo) => (
              <View key={tipo.campo}>
                <Text style={styles.formLabel}>Menção de {tipo.label.toLowerCase()}</Text>
                <MencaoOptions
                  value={mencoesForm[tipo.campo]}
                  onChange={(valor) => setMencoesForm({ ...mencoesForm, [tipo.campo]: valor })}
                />
              </View>
            ))}

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <Pressable
              style={[primaryButtonStyles.button, styles.saveButton, saving && primaryButtonStyles.disabled]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
            >
              <Text style={primaryButtonStyles.label}>{saving ? 'Salvando...' : alunoIds.length > 1 ? `Salvar ${alunoIds.length} notas` : 'Salvar nota'}</Text>
            </Pressable>
          </View>
        )}

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={boletimColors.muted} />
          </View>
        ) : errorMessage ? (
          <View style={[styles.stateCard, styles.errorCard]}>
            <Text style={styles.errorTitle}>Dados indisponíveis</Text>
            <Text style={styles.stateText}>{errorMessage}</Text>
          </View>
        ) : nenhumaNota ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>Nenhuma nota encontrada.</Text>
          </View>
        ) : isProfessor ? (
          notasFiltradas.map((nota) => <NotaCard key={nota.id} nota={nota} onChange={loadNotas} />)
        ) : (
          linhas.map((linha) => (
            <View key={linha.chave} style={styles.subjectCard}>
              <Text style={styles.subjectName}>{linha.disciplina}</Text>
              {!isAluno && (
                <Text style={styles.subjectMeta}>
                  {linha.aluno} · {linha.turma}
                </Text>
              )}

              <View style={styles.bimestres}>
                {bimestres.map((bimestre) => {
                  const mencao = linha.mencoes[bimestre];
                  const mencaoStyle = createMencaoStyle(mencao);

                  return (
                    <View key={bimestre} style={styles.bimestre}>
                      <Text style={styles.bimestreLabel}>{bimestre}º bim</Text>
                      <View style={[styles.mencaoPill, mencaoStyle.pill]}>
                        <Text style={[styles.mencaoText, mencaoStyle.text]}>{mencao ?? '—'}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <EloTabBar active="Boletim" navigation={navigation} variant={route.params?.profile === 'Professor' ? 'professor' : 'student'} />
    </SafeAreaView>
  );
}
