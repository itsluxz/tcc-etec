# Boletim — integração da tela com a API

Este documento explica as mudanças feitas no frontend para a tela de boletim mostrar as menções vindas do backend (`GET /notas`). As decisões do backend estão em `backend/notas/decisao_boletim.md`.

---

## Arquivos alterados

| Arquivo | O que mudou |
|---|---|
| `src/services/endpoints.js` | Novos `notasApi`, `turmasApi`, `disciplinasApi` e `usuariosApi`, iguais ao `cardapiosApi` |
| `src/screens/boletim/BoletimScreen.js` | Busca as notas na API, mostra as menções por bimestre e tem o botão de adicionar nota |
| `src/screens/boletim/NotaModal.js` | Modal com as notas dos 4 bimestres: ver, lançar, trocar menções e excluir |
| `src/screens/boletim/MencaoOptions.js` | Os 4 botões de menção, usados no formulário e na edição |
| `src/styles/screens/boletim.js` | Estilos dos cartões, do formulário, do menu e cor de cada menção |
| `backend/notas/routes.py` | Três menções por nota, menção final calculada e 409 para nota repetida |
| `src/navigation/MainTabs.js` | Passa o usuário logado para a tela de boletim |
| `src/screens/login/LoginScreen.js` | Correção: o login chamava `api`, que não estava importado |

---

## 1. `notasApi` em `endpoints.js`

Segue o mesmo modelo de `authenticationApi` e `cardapiosApi`: cada rota do backend vira uma função.

```js
export const notasApi = {
  // filtros opcionais: { aluno_id, turma_id, bimestre }
  list: (filtros) => api.get('/notas', { params: filtros }),
  get: (notaId) => api.get(`/notas/${notaId}`),
  create: (nota) => api.post('/notas', nota),
  update: (notaId, nota) => api.put(`/notas/${notaId}`, nota),
  remove: (notaId) => api.delete(`/notas/${notaId}`),
};
```

**Conceito novo: `params` do axios.** Em vez de montar a URL na mão (`'/notas?aluno_id=' + id`), passamos um objeto e o axios monta a URL sozinho:

```js
notasApi.list({ aluno_id: 9 })  // GET /notas?aluno_id=9
notasApi.list({})               // GET /notas
```

A tela usa o `list` para mostrar o boletim e o `create` no botão de adicionar nota. `get`, `update` e `remove` ficaram prontos para quando a tela permitir editar ou apagar notas.

Para o formulário, também foram criados:

```js
turmasApi.list()                                 // GET /turmas
disciplinasApi.list({ professor_id: 14 })        // GET /disciplinas?professor_id=14
usuariosApi.list({ tipo: 'ALUNO', turma_id: 1 }) // GET /usuarios?tipo=ALUNO&turma_id=1
```

---

## 2. Como a tela sabe quem está logado

O `/login` devolve o usuário (`id`, `nome`, `tipo`...). O caminho até a tela de boletim é:

1. `LoginScreen` envia o usuário para as abas: `navigation.replace('Main', { profile, user: data })`.
2. `MainTabs` repassa o usuário para as telas com `initialParams`. Antes ele só ia para o `Início`; agora vai também para o `Boletim`:
   ```js
   const userParams = { profile: route.params?.profile, user: route.params?.user };
   <Tab.Screen name="Boletim" component={BoletimScreen} initialParams={userParams} ... />
   ```
3. `BoletimScreen` lê o usuário com `route.params?.user`.

O nome `user` foi escolhido porque já era o usado pela `HomeScreen` (`route.params?.user?.nome`).

---

## 3. A tela `BoletimScreen`

### Buscando as notas (mesmo modo do login)

```js
async function loadNotas() {
  setErrorMessage('');
  try {
    // aluno vê só o boletim dele; professor e gestão veem o de todos
    const { data } = await notasApi.list(isAluno ? { aluno_id: user.id } : {});
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
```

O padrão é o mesmo do `handleLogin`: `try` chama a API, `catch` usa o `getApiErrorMessage` para mostrar o `detail` do backend. A diferença é que aqui a chamada acontece sozinha quando a tela abre. O `loadNotas` fica fora do `useEffect` porque também é chamado depois de salvar uma nota nova, para a lista se atualizar.

**Conceitos novos:**
- **`useEffect(() => { ... }, [])`**: roda o código **uma vez**, quando a tela aparece. O `[]` no final quer dizer "não rode de novo". O login não precisava disso porque a chamada acontece no clique do botão.
- **`finally`**: roda depois do `try` **ou** do `catch`, dê certo ou errado. Por isso o `setLoading(false)` fica nele, e não repetido nos dois.

### Quem vê o quê

| Perfil | Chamada | O que aparece |
|---|---|---|
| Aluno | `GET /notas?aluno_id={user.id}` | O boletim inteiro dele: um cartão por disciplina, com a **menção final** de cada bimestre |
| Professor | `GET /notas?turma_id={turma}` | Escolhe a turma, vê um cartão por aluno e, no modal do aluno, escolhe a matéria (só as que ele dá aula). Ver seção 6 |
| Gestão | `GET /notas?turma_id={turma}` | Igual ao professor, mas com todas as matérias. Ver seção 6 |

### Juntando as notas por disciplina (aluno e gestão)

A API devolve **uma linha por bimestre**, já com a menção final calculada:

```json
[
  { "aluno_id": 9, "disciplina_id": 2, "bimestre": 1, "mencao_final": "B", "aluno": { "nome": "Maria" }, "disciplina": { "nome": "Matemática" } },
  { "aluno_id": 9, "disciplina_id": 2, "bimestre": 2, "mencao_final": "MB", "aluno": { "nome": "Maria" }, "disciplina": { "nome": "Matemática" } }
]
```

Mas a tela mostra **um cartão por disciplina**, com a menção final dos 4 bimestres lado a lado. A função `agruparPorDisciplina` faz essa junção:

```js
{ chave: "9-2", disciplina: "Matemática", aluno: "Maria", mencoes: { 1: "B", 2: "MB" } }
```

A chave junta `aluno_id` e `disciplina_id` porque, para professor e gestão, a mesma disciplina aparece para vários alunos. O nome mostrado no cartão vem de `nota.disciplina.nome`. O bimestre sem nota aparece como `—`.

### Busca

O campo de busca filtra pelo nome da disciplina e, para professor e gestão, também pelo nome do aluno. Ele filtra só o que já foi carregado, sem chamar a API de novo.

### Estados da tela

Na ordem em que são verificados:
1. **Carregando:** um `ActivityIndicator` enquanto a API não responde.
2. **Erro:** o cartão vermelho "Dados indisponíveis", com a mensagem do backend.
3. **Vazio:** "Nenhuma nota encontrada." (também aparece quando a busca não acha nada).
4. **Com notas:** um cartão por disciplina.

---

## 4. Cores das menções (`styles/screens/boletim.js`)

| Menção | Significado | Cor |
|---|---|---|
| I | Insatisfatório | vermelho (`colors.danger`) |
| R | Regular | laranja (`colors.warning`) |
| B | Bom | azul (`colors.info`) |
| MB | Muito Bom | verde (`colors.success`) |

As cores vêm de `styles/global.js`, as mesmas usadas no resto do app. A função `createMencaoStyle` segue o padrão das outras funções `create...Style` do projeto (`createGradeStyle`, `createMenuDotStyle`...):

```js
export const createMencaoStyle = (mencao) => {
  const color = mencaoColors[mencao] ?? muted;
  return {
    pill: { backgroundColor: `${color}1A` },
    text: { color },
  };
};
```

O `1A` no final da cor é a transparência em hexadecimal (cerca de 10%). Assim, o fundo da menção fica com a mesma cor do texto, só que bem clara. Bimestre sem nota usa a cor cinza (`muted`).

A tela **não mostra "Aprovado/Reprovado"**. No meio do ano isso seria enganoso, porque a menção final é decidida no fim do período. A legenda acima dos cartões explica o que cada letra significa.

---

## 5. Botão de adicionar nota

Só aparece para **professor e gestão** (`!isAluno`). O botão `+ Adicionar nota` abre um formulário logo abaixo dele, na própria tela, sem abrir outra tela. Com o formulário aberto, o botão vira `Cancelar`.

### O formulário

| Campo | Como é preenchido |
|---|---|
| Turma | Botões com cada turma (`nome (ano)`), vindos de `GET /turmas` quando o formulário abre |
| Alunos | Botões com os alunos **da turma escolhida**, vindos de `GET /usuarios?tipo=ALUNO&turma_id=...`. Dá para marcar **vários**: todos recebem a mesma disciplina, bimestre e menções |
| Disciplina | Botões com as disciplinas, vindos de `GET /disciplinas` quando o formulário abre. O **professor** só vê as que dá aula (`?professor_id={user.id}`); a **gestão** vê todas |
| Bimestre | Botões `1º` a `4º bim` |
| Menção de trabalho | Botões `I`, `R`, `B`, `MB`, com a cor da menção quando selecionado |
| Menção de atividades | Idem |
| Menção de prova | Idem |

O `professor_id` que o `POST /notas` precisa é preenchido sozinho com o `id` de quem está logado (`user.id`). A menção final **não** é escolhida no formulário: a API calcula a média das três (veja `decisao_boletim.md`).

### Três menções sem repetir código

As três menções ficam num objeto só, `mencoesForm`, com uma chave para cada:

```js
{ mencao_trabalho: 'B', mencao_atividades: 'MB', mencao_prova: 'R' }
```

A lista `tiposMencao` (em `MencaoOptions.js`) diz quais são as três e o nome de cada uma. O formulário percorre essa lista e desenha um grupo de botões para cada menção:

```js
{tiposMencao.map((tipo) => (
  <View key={tipo.campo}>
    <Text style={styles.formLabel}>Menção de {tipo.label.toLowerCase()}</Text>
    <MencaoOptions
      value={mencoesForm[tipo.campo]}
      onChange={(valor) => setMencoesForm({ ...mencoesForm, [tipo.campo]: valor })}
    />
  </View>
))}
```

- **`[tipo.campo]: valor`**: o nome da chave vem de uma variável. Para a prova, vira `mencao_prova: valor`.
- **`{ ...mencoesForm, ... }`**: copia as menções já escolhidas e troca só a que mudou. É o mesmo cuidado da lista de alunos: o estado é trocado por um objeto novo, nunca alterado.
- Na hora de salvar, `...mencoesForm` espalha as três chaves dentro do corpo do `POST /notas`.

**`MencaoOptions`** é um componente pequeno com os 4 botões (`I`, `R`, `B`, `MB`). Ele recebe `value` (a menção marcada) e `onChange` (o que fazer ao tocar). É usado 3 vezes no formulário e 3 vezes na edição do cartão, sem repetir o código dos botões.

Se o professor ainda não estiver ligado a nenhuma disciplina, aparece "Nenhuma disciplina cadastrada para você.". A ligação é feita pela API: `POST /disciplinas/{id}/professores`. Mesmo que alguém tente lançar nota de outra disciplina chamando a API direto, o backend recusa com "Esse professor não dá aula dessa disciplina".

### Turma primeiro, depois aluno

```js
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
```

Ao trocar de turma, os alunos marcados antes são desmarcados (`setAlunoIds([])`), porque eles podem não ser da turma nova. Enquanto nenhuma turma é escolhida, aparece "Escolha uma turma primeiro." no lugar dos alunos. Se a turma não tiver alunos, aparece "Nenhum aluno nessa turma.".

A turma escolhida também é o `turma_id` enviado na nota. Assim, a nota fica registrada na turma em que o aluno estava quando foi avaliado.

### Vários alunos de uma vez

Os alunos marcados ficam numa lista (`alunoIds`). Tocar em um aluno marca ou desmarca:

```js
// marca ou desmarca o aluno (dá para escolher vários)
function toggleAluno(id) {
  if (alunoIds.includes(id)) {
    setAlunoIds(alunoIds.filter((item) => item !== id));
  } else {
    setAlunoIds([...alunoIds, id]);
  }
}
```

- `alunoIds.includes(id)`: o aluno já está marcado?
- `alunoIds.filter((item) => item !== id)`: nova lista **sem** esse aluno (desmarca).
- `[...alunoIds, id]`: nova lista com todos que já estavam **mais** esse aluno (marca). Os `...` copiam os itens da lista antiga.

A lista é sempre trocada por uma nova, nunca alterada com `push`. O React só redesenha a tela quando o estado recebe um valor novo.

O botão de salvar mostra quantas notas vão ser lançadas: "Salvar nota" ou "Salvar 3 notas".

### Salvando (`handleSave`)

Antes de chamar a API, a tela confere se todos os campos foram preenchidos e se pelo menos um aluno foi marcado ("Preencha todos os campos.").

O `POST /notas` recebe **uma nota por vez**, então a tela chama a API uma vez para cada aluno marcado:

```js
for (const alunoId of alunoIds) {
  try {
    await notasApi.create({ aluno_id: alunoId, ... });
  } catch (error) {
    const aluno = alunos.find((item) => item.id === alunoId);
    erros.push(`${aluno?.nome}: ${getApiErrorMessage(error, 'não foi possível salvar a nota.')}`);
    alunosComErro.push(alunoId);
  }
}
```

O `try/catch` fica **dentro** do `for`. Assim, se um aluno der erro (por exemplo, já tem nota naquele bimestre), os outros continuam sendo salvos.

Depois do `for`:
- o boletim é recarregado (`loadNotas`), para as notas que deram certo aparecerem;
- se **tudo** deu certo, o formulário fecha e limpa os campos (`closeForm`);
- se **algum** deu erro, o formulário continua aberto, mostra uma linha por aluno com o motivo e deixa marcados **só os alunos que deram erro**. Assim, ao tentar de novo, as notas que já foram salvas não são enviadas outra vez.

Como no login, `saving` desabilita o botão e troca o texto para "Salvando..." enquanto as chamadas acontecem.

### Nota repetida

O banco não deixa lançar duas notas para o mesmo aluno, na mesma disciplina e bimestre (regra `unique` explicada em `decisao_boletim.md`). Antes, o backend devolvia a mensagem crua do banco ("duplicate key value violates..."). Agora devolve **409** com:

> Esse aluno já tem nota nessa disciplina e bimestre

É o mesmo tratamento feito para e-mail repetido em `users/routes.py`. Para trocar uma menção já lançada, será preciso uma opção de editar (`PUT /notas/{id}`), que a tela ainda não tem.

### Conceito novo: botões como opções

Em vez de um `<select>`, as opções são uma lista de `Pressable`. O selecionado fica guardado no estado e muda o estilo do botão:

```js
<Pressable
  style={[styles.option, bimestre === item && styles.optionActive]}
  onPress={() => setBimestre(item)}
>
```

`bimestre === item && styles.optionActive` só aplica o estilo azul quando aquele botão é o escolhido. Se a condição for falsa, o React Native ignora o `false` dentro da lista de estilos.

---

## 6. Turma → aluno → matéria (professor e gestão)

Professor e gestão não veem mais uma lista de notas soltas. A tela segue três passos:

1. **Turma**: um `Select` no topo, com as turmas de `GET /turmas` (as mais recentes primeiro). Antes de escolher, a tela mostra "Escolha uma turma para ver os alunos."
2. **Alunos**: ao escolher a turma, a tela busca ao mesmo tempo (`Promise.all`) os alunos (`GET /usuarios?tipo=ALUNO&turma_id=…`) e as notas da turma (`GET /notas?turma_id=…`). Cada aluno vira um cartão com as iniciais, o nome e o **curso**. A busca filtra os alunos pelo nome.
3. **Modal do aluno**: tocar no cartão abre o `NotaModal` com os botões de **Matéria** no topo. Escolhida a matéria, aparecem os 4 bimestres com as menções daquele aluno naquela matéria.

O banco não tem um campo de curso: o curso é o nome da turma (ex.: "Informatica Para Internet · 2026").

As matérias vêm de `GET /disciplinas`. O professor vê só as que dá aula (`?professor_id=`), e a gestão vê todas. Se só existe uma matéria, o modal já abre nela.

### No modal

- **Bimestre com nota**: mostra Trabalho, Atividades, Prova e Final, com **Trocar menções** (`PUT /notas/{id}`) e **Excluir** (`DELETE /notas/{id}`). A exclusão pede confirmação no próprio modal, porque os botões do `Alert` não funcionam no navegador.
- **Bimestre vazio**: mostra **+ Lançar menções**, que abre os mesmos botões de menção. Salvar chama `POST /notas` só com as menções escolhidas; as que faltarem podem ser lançadas depois.

O `NotaModal` é o mesmo do aluno. O que muda são as props:
- `children`: os botões de matéria, mostrados acima dos bimestres;
- `novaNota`: `{ aluno_id, professor_id, turma_id, disciplina_id }`. Com ela, os bimestres vazios ganham o **+ Lançar menções**;
- `emptyText`: o texto mostrado enquanto nenhuma matéria foi escolhida.

Depois de salvar ou excluir, o modal chama `onChange` e a tela recarrega as notas da turma. Como o modal lê as notas do estado da tela, ele já mostra a menção final recalculada.

O botão **+ Adicionar nota** continua servindo para lançar a mesma menção para vários alunos de uma vez. Ele já abre com a turma que está na tela.

---

## 7. Correção no login

O `LoginScreen` importava `authenticationApi`, mas chamava `api.post(...)`, e `api` não estava importado. O login quebrava com `api is not defined`. Agora ele usa o que já estava importado:

```js
const { data } = await authenticationApi.login({ email: email.trim(), senha: password });
```

O usuário também passou a ir como `user` (antes `usuario`), que é o nome que o `MainTabs` e a `HomeScreen` já liam.

---

## Uma menção por vez

Antes, o formulário exigia as três menções (trabalho, atividades e prova) juntas. Agora o professor escolhe **um tipo de menção** e o valor, marca quantos alunos quiser e salva. As outras menções ficam para depois.

Exemplo: no 3º bimestre de Biologia, marcar dois alunos, escolher **Trabalho** e **B**, salvar. Na semana seguinte, marcar os mesmos alunos, escolher **Prova** e lançar a menção da prova.

### Banco

As três colunas de menção passam a aceitar vazio. Script em `backend/banco_dados/notas_mencoes_opcionais.sql`:

```sql
alter table notas alter column mencao_trabalho drop not null;
alter table notas alter column mencao_atividades drop not null;
alter table notas alter column mencao_prova drop not null;
```

O `check (... in ('I', 'R', 'B', 'MB'))` continua valendo quando a menção é preenchida.

### `POST /notas`

- As três menções são opcionais, mas é preciso mandar pelo menos uma ("Escolha pelo menos uma menção").
- Se o aluno **ainda não tem** nota naquela disciplina e bimestre, a nota é criada só com a menção enviada (201 "Nota lançada com sucesso").
- Se ele **já tem**, a menção enviada é adicionada à nota que existe (200 "Menção adicionada à nota"). Antes isso dava 409.
- Se a menção enviada **já estava lançada**, a API recusa (409 "Esse aluno já tem menção de trabalho nesse bimestre"). Para trocar uma menção já lançada, use o **Editar** do cartão.

```js
await notasApi.create({
  aluno_id: alunoId,
  professor_id: user.id,
  turma_id: turmaId,
  disciplina_id: disciplinaId,
  bimestre,
  [tipoMencao]: mencao, // ex: { mencao_trabalho: 'B' }
});
```

### Menção final

A `mencao_final` só é calculada quando as três menções estão preenchidas. Enquanto faltar alguma, ela vem `null` e o cartão mostra `—`. No modal, as menções que faltam também aparecem como `—`, e o **Trocar menções** permite preenchê-las.
