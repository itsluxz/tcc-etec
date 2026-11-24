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
import NotaCard from './NotaCard';
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
        aluno: nota.aluno?.nome,
        turma: nota.turma?.nome,
        mencoes: {},
        notas: {}, // a nota completa de cada bimestre, para o modal
      };
    }
    linhas[chave].mencoes[nota.bimestre] = nota.mencao_final;
    linhas[chave].notas[nota.bimestre] = nota;
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

  // cartão aberto no modal: { notaId } no professor, { chave } no aluno e na gestão
  const [aberto, setAberto] = useState(null);

  // formulário de nova nota (só professor e gestão)
  const [showForm, setShowForm] = useState(false);
  const [turmas, setTurmas] = useState([]);
  const [turmaId, setTurmaId] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [alunoIds, setAlunoIds] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinaId, setDisciplinaId] = useState(null);
  const [bimestre, setBimestre] = useState(null);
  // uma menção por vez: o tipo (trabalho, atividades ou prova) e o valor (I, R, B, MB)
  const [tipoMencao, setTipoMencao] = useState(null);
  const [mencao, setMencao] = useState(null);
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

  // professor: um cartão por nota (com editar e excluir)
  const notasFiltradas = notas.filter((nota) =>
    `${nota.disciplina?.nome} ${nota.aluno?.nome}`.toLowerCase().includes(query),
  );

  // aluno e gestão: um cartão por disciplina, com a menção final de cada bimestre
  const linhas = agruparPorDisciplina(notas).filter((linha) =>
    `${linha.disciplina} ${linha.aluno ?? ''}`.toLowerCase().includes(query),
  );

  const nenhumaNota = isProfessor ? notasFiltradas.length === 0 : linhas.length === 0;

  // o modal lê do estado atual, então mostra a nota já atualizada depois de salvar
  const notaAberta = aberto?.notaId ? notas.find((nota) => nota.id === aberto.notaId) : null;
  const linhaAberta = aberto?.chave ? agruparPorDisciplina(notas).find((linha) => linha.chave === aberto.chave) : null;
  const modal = notaAberta
    ? {
        title: notaAberta.disciplina?.nome,
        subtitle: `${notaAberta.aluno?.nome} · ${notaAberta.turma?.nome}`,
        notas: { [notaAberta.bimestre]: notaAberta },
        bimestres: [notaAberta.bimestre],
      }
    : linhaAberta
      ? {
          title: linhaAberta.disciplina,
          subtitle: isAluno ? '' : `${linhaAberta.aluno} · ${linhaAberta.turma}`,
          notas: linhaAberta.notas,
          bimestres,
        }
      : null;

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
        ) : nenhumaNota ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>Nenhuma nota encontrada.</Text>
          </View>
        ) : isProfessor ? (
          notasFiltradas.map((nota) => <NotaCard key={nota.id} nota={nota} onPress={() => setAberto({ notaId: nota.id })} />)
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
                  {!isAluno && (
                    <Text style={styles.subjectMeta}>
                      {linha.aluno} · {linha.turma}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={boletimColors.muted} />
              </View>

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
            </Pressable>
          ))
        )}
      </ScrollView>

      <NotaModal
        visible={Boolean(modal)}
        title={modal?.title}
        subtitle={modal?.subtitle}
        notas={modal?.notas ?? {}}
        bimestres={modal?.bimestres ?? []}
        podeEditar={!isAluno}
        onClose={() => setAberto(null)}
        onChange={loadNotas}
      />

      <EloTabBar active="Boletim" navigation={navigation} variant={route.params?.profile === 'Professor' ? 'professor' : 'student'} />
    </SafeAreaView>
  );
}
