import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import EloTabBar from '../../components/EloTabBar';
import Select from '../../components/Select';
import { disciplinasApi, notasApi, turmasApi, usuariosApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { contentTopStyle, primaryButtonStyles } from '../../styles/common';
import { boletimColors, createMencaoStyle, boletimStyles as styles } from '../../styles/screens/boletim';
import MencaoOptions, { tiposMencao } from './MencaoOptions';
import NotaModal from './NotaModal';

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
        mencoes: {},
        notas: {}, // a nota completa de cada bimestre, para o modal
      };
    }
    linhas[chave].mencoes[nota.bimestre] = nota.mencao_final;
    linhas[chave].notas[nota.bimestre] = nota;
  });

  return Object.values(linhas);
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
  return turma ? `${turma.nome} · ${turma.ano}` : '';
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

  // aluno: cartão de disciplina aberto no modal
  const [aberto, setAberto] = useState(null);

  // professor e gestão: turma escolhida -> alunos dela -> modal do aluno com a matéria escolhida
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]); // professor: só as que ele dá aula
  const [turmaAtual, setTurmaAtual] = useState(null);
  const [alunosTurma, setAlunosTurma] = useState([]);
  const [alunoAberto, setAlunoAberto] = useState(null);
  const [disciplinaModal, setDisciplinaModal] = useState(null);

  // formulário de nova nota (só professor e gestão)
  const [showForm, setShowForm] = useState(false);
  const [turmaId, setTurmaId] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [alunoIds, setAlunoIds] = useState([]);
  const [disciplinaId, setDisciplinaId] = useState(null);
  const [bimestre, setBimestre] = useState(null);
  // uma menção por vez: o tipo (trabalho, atividades ou prova) e o valor (I, R, B, MB)
  const [tipoMencao, setTipoMencao] = useState(null);
  const [mencao, setMencao] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // aluno: o boletim dele; professor e gestão: as notas da turma escolhida
  async function loadNotas(turma = turmaAtual) {
    if (!isAluno && !turma) return;

    setErrorMessage('');
    try {
      const { data } = await notasApi.list(isAluno ? { aluno_id: user.id } : { turma_id: turma });
      setNotas(data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar o boletim.'));
    } finally {
      setLoading(false);
    }
  }

  // professor e gestão: carrega as turmas (para escolher) e as matérias (para o modal)
  async function loadTurmasEDisciplinas() {
    setErrorMessage('');
    try {
      const [turmasResposta, disciplinasResposta] = await Promise.all([
        turmasApi.list(),
        disciplinasApi.list(isProfessor ? { professor_id: user.id } : {}),
      ]);
      // mais recentes primeiro, depois pelo nome
      const ordenadas = [...turmasResposta.data].sort(
        (primeira, segunda) => segunda.ano - primeira.ano || primeira.nome.localeCompare(segunda.nome),
      );
      setTurmas(ordenadas);
      setDisciplinas(disciplinasResposta.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar as turmas.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAluno) loadNotas();
    else loadTurmasEDisciplinas();
  }, []);

  // ao escolher a turma, busca os alunos e as notas dela
  async function escolherTurma(id) {
    setTurmaAtual(id);
    setSearch('');
    setLoading(true);
    setErrorMessage('');
    try {
      const [alunosResposta, notasResposta] = await Promise.all([
        usuariosApi.list({ tipo: 'ALUNO', turma_id: id }),
        notasApi.list({ turma_id: id }),
      ]);
      setAlunosTurma([...alunosResposta.data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNotas(notasResposta.data);
    } catch (error) {
      setAlunosTurma([]);
      setNotas([]);
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar os alunos da turma.'));
    } finally {
      setLoading(false);
    }
  }

  function abrirAluno(aluno) {
    setAlunoAberto(aluno);
    // se a pessoa só tem uma matéria, já abre nela
    setDisciplinaModal(disciplinas.length === 1 ? disciplinas[0].id : null);
  }

  function openForm() {
    setShowForm(true);
    setFormError('');
    // já começa na turma que está na tela
    if (turmaAtual) selectTurma(turmaAtual);
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

  function closeForm() {
    setShowForm(false);
    setTurmaId(null);
    setAlunos([]);
    setAlunoIds([]);
    setDisciplinaId(null);
    setBimestre(null);
    setTipoMencao(null);
    setMencao(null);
    setFormError('');
  }

  async function handleSave() {
    if (!turmaId || alunoIds.length === 0 || !disciplinaId || !bimestre || !tipoMencao || !mencao) {
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
          // só a menção escolhida, ex: { mencao_trabalho: 'B' }; as outras são lançadas depois
          [tipoMencao]: mencao,
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

  // aluno: um cartão por disciplina, com a menção final de cada bimestre
  const linhas = agruparPorDisciplina(notas).filter((linha) => `${linha.disciplina}`.toLowerCase().includes(query));
  const linhaAberta = aberto?.chave ? agruparPorDisciplina(notas).find((linha) => linha.chave === aberto.chave) : null;

  // professor e gestão: um cartão por aluno da turma escolhida
  const turmaSelecionada = turmas.find((turma) => turma.id === turmaAtual);
  const alunosFiltrados = alunosTurma.filter((aluno) => aluno.nome.toLowerCase().includes(query));

  // notas do aluno aberto na matéria escolhida, uma por bimestre
  // (o modal lê do estado atual, então mostra a nota já atualizada depois de salvar)
  const notasDoAluno = {};
  if (alunoAberto && disciplinaModal) {
    notas
      .filter((nota) => nota.aluno_id === alunoAberto.id && nota.disciplina_id === disciplinaModal)
      .forEach((nota) => {
        notasDoAluno[nota.bimestre] = nota;
      });
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
            <Text style={styles.logoText}>elo</Text>
          </View>
          <View style={styles.notification}>
            <Text style={styles.bell}>🔔</Text>
            <View style={styles.notificationDot} />
          </View>
        </View>

        <Text style={styles.title}>Boletim</Text>
        <Text style={styles.subtitle}>{isAluno ? 'Menções finais por bimestre' : 'Escolha a turma e depois o aluno'}</Text>

        {!isAluno && (
          <>
            <Text style={styles.formLabel}>Turma</Text>
            <Select
              options={turmas.map((turma) => ({ value: turma.id, label: `${turma.nome} (${turma.ano})` }))}
              value={turmaAtual}
              onChange={escolherTurma}
              placeholder="Selecione a turma"
              emptyText="Nenhuma turma cadastrada."
            />
          </>
        )}

        {(isAluno || turmaAtual) && (
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={isAluno ? 'Buscar disciplina' : 'Buscar aluno'}
              placeholderTextColor={boletimColors.muted}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

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
            <Select
              options={turmas.map((turma) => ({ value: turma.id, label: `${turma.nome} (${turma.ano})` }))}
              value={turmaId}
              onChange={selectTurma}
              placeholder="Selecione a turma"
              emptyText="Nenhuma turma cadastrada."
            />

            <Text style={styles.formLabel}>Alunos</Text>
            <Select
              multiple
              options={alunos.map((aluno) => ({ value: aluno.id, label: aluno.nome }))}
              values={alunoIds}
              onChange={setAlunoIds}
              placeholder={turmaId ? 'Selecione os alunos' : 'Escolha uma turma primeiro'}
              emptyText="Nenhum aluno nessa turma."
              disabled={!turmaId}
            />

            <Text style={styles.formLabel}>Disciplina</Text>
            <Select
              options={disciplinas.map((item) => ({ value: item.id, label: item.nome }))}
              value={disciplinaId}
              onChange={setDisciplinaId}
              placeholder="Selecione a disciplina"
              emptyText="Nenhuma disciplina cadastrada para você."
            />

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

            <Text style={styles.formLabel}>Tipo de menção</Text>
            <View style={styles.options}>
              {tiposMencao.map((tipo) => (
                <Pressable
                  key={tipo.campo}
                  style={[styles.option, tipoMencao === tipo.campo && styles.optionActive]}
                  onPress={() => setTipoMencao(tipo.campo)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: tipoMencao === tipo.campo }}
                >
                  <Text style={[styles.optionText, tipoMencao === tipo.campo && styles.optionTextActive]}>{tipo.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.formLabel}>
              {tipoMencao
                ? `Menção de ${tiposMencao.find((tipo) => tipo.campo === tipoMencao).label.toLowerCase()}`
                : 'Menção'}
            </Text>
            <MencaoOptions value={mencao} onChange={setMencao} />
            <Text style={styles.formHint}>
              As outras menções podem ser lançadas depois. A menção final aparece quando as três estiverem preenchidas.
            </Text>

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <Pressable
              style={[primaryButtonStyles.button, styles.saveButton, saving && primaryButtonStyles.disabled]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
            >
              <Text style={primaryButtonStyles.label}>{saving ? 'Salvando...' : alunoIds.length > 1 ? `Salvar para ${alunoIds.length} alunos` : 'Salvar menção'}</Text>
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
        ) : isAluno ? (
          linhas.length === 0 ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateText}>Nenhuma nota encontrada.</Text>
            </View>
          ) : (
            linhas.map((linha) => (
              <Pressable
                key={linha.chave}
                style={({ pressed }) => [styles.subjectCard, pressed && styles.cardPressed]}
                onPress={() => setAberto({ chave: linha.chave })}
                accessibilityRole="button"
                accessibilityLabel={`Abrir notas de ${linha.disciplina}`}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitle}>
                    <Text style={styles.subjectName}>{linha.disciplina}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={boletimColors.muted} />
                </View>

                <View style={styles.bimestres}>
                  {bimestres.map((item) => {
                    const mencaoFinal = linha.mencoes[item];
                    const mencaoStyle = createMencaoStyle(mencaoFinal);

                    return (
                      <View key={item} style={styles.bimestre}>
                        <Text style={styles.bimestreLabel}>{item}º bim</Text>
                        <View style={[styles.mencaoPill, mencaoStyle.pill]}>
                          <Text style={[styles.mencaoText, mencaoStyle.text]}>{mencaoFinal ?? '—'}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Pressable>
            ))
          )
        ) : !turmaAtual ? (
          <View style={styles.stateCard}>
            <Ionicons name="people-outline" size={26} color={boletimColors.muted} />
            <Text style={styles.stateText}>Escolha uma turma para ver os alunos.</Text>
          </View>
        ) : alunosFiltrados.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>{query ? 'Nenhum aluno encontrado.' : 'Nenhum aluno nessa turma.'}</Text>
          </View>
        ) : (
          alunosFiltrados.map((aluno) => (
            <Pressable
              key={aluno.id}
              style={({ pressed }) => [styles.studentCard, pressed && styles.cardPressed]}
              onPress={() => abrirAluno(aluno)}
              accessibilityRole="button"
              accessibilityLabel={`Abrir notas de ${aluno.nome}`}
            >
              <View style={styles.studentAvatar}>
                <Text style={styles.studentInitials}>{iniciais(aluno.nome)}</Text>
              </View>
              <View style={styles.cardTitle}>
                <Text style={styles.subjectName}>{aluno.nome}</Text>
                <Text style={styles.subjectMeta}>{nomeDoCurso(turmaSelecionada)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={boletimColors.muted} />
            </Pressable>
          ))
        )}
      </ScrollView>

      {isAluno ? (
        <NotaModal
          visible={Boolean(linhaAberta)}
          title={linhaAberta?.disciplina}
          notas={linhaAberta?.notas ?? {}}
          bimestres={bimestres}
          podeEditar={false}
          onClose={() => setAberto(null)}
          onChange={() => loadNotas()}
        />
      ) : (
        <NotaModal
          visible={Boolean(alunoAberto)}
          title={alunoAberto?.nome}
          subtitle={nomeDoCurso(turmaSelecionada)}
          notas={notasDoAluno}
          bimestres={disciplinaModal ? bimestres : []}
          podeEditar
          novaNota={
            alunoAberto && disciplinaModal
              ? { aluno_id: alunoAberto.id, professor_id: user?.id, turma_id: turmaAtual, disciplina_id: disciplinaModal }
              : undefined
          }
          emptyText={
            disciplinas.length
              ? 'Escolha a matéria para ver as notas.'
              : isProfessor
                ? 'Nenhuma matéria cadastrada para você.'
                : 'Nenhuma matéria cadastrada.'
          }
          onClose={() => setAlunoAberto(null)}
          onChange={() => loadNotas()}
        >
          {disciplinas.length ? (
            <>
              <Text style={styles.formLabel}>Matéria</Text>
              <View style={styles.options}>
                {disciplinas.map((disciplina) => {
                  const ativa = disciplinaModal === disciplina.id;
                  return (
                    <Pressable
                      key={disciplina.id}
                      style={[styles.option, ativa && styles.optionActive]}
                      onPress={() => setDisciplinaModal(disciplina.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: ativa }}
                    >
                      <Text style={[styles.optionText, ativa && styles.optionTextActive]}>{disciplina.nome}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </NotaModal>
      )}

      <EloTabBar active="Boletim" navigation={navigation} variant={route.params?.profile === 'Professor' ? 'professor' : 'student'} />
    </SafeAreaView>
  );
}
