# elo — Frontend (aplicativo)

Aplicativo do **elo**, o Portal Educacional do TCC. É por ele que alunos, professores e gestão veem o mural, o boletim, a merenda, as reservas de sala e o atendimento. Ele não guarda dados: tudo vem da API (ver [`../backend/README.md`](../backend/README.md)).

- **Framework:** React Native 0.88 com **Expo** (SDK 58)
- **Navegação:** React Navigation 7
- **Requisições HTTP:** Axios
- **Ícones:** Ionicons (`@expo/vector-icons`)
- **Imagens da galeria:** `expo-image-picker`

---

## Sumário

1. [Como rodar](#1-como-rodar)
2. [Estrutura de pastas](#2-estrutura-de-pastas)
3. [Telas e o que cada perfil vê](#3-telas-e-o-que-cada-perfil-vê)
4. [Como o app fala com a API](#4-como-o-app-fala-com-a-api)
5. [Navegação e usuário logado](#5-navegação-e-usuário-logado)
6. [Padrões usados nas telas](#6-padrões-usados-nas-telas)
7. [Estilos](#7-estilos)
8. [Decisões do projeto (e por quê)](#8-decisões-do-projeto-e-por-quê)
9. [Limitações conhecidas](#9-limitações-conhecidas)

---

## 1. Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (o projeto é desenvolvido no 24)
- O app **Expo Go** no celular (Android ou iOS)
- A API rodando (ver o [README do backend](../backend/README.md#1-como-rodar))

### Passo a passo

```bash
cd frontend
npm install
```

```bash
npx expo start
```

O terminal mostra um **QR code**. No Android, abra o Expo Go e leia o código; no iPhone, leia com a câmera. O celular e o computador precisam estar **na mesma rede Wi-Fi**.

### Endereço da API (`.env`)

O app descobre sozinho o endereço da API: ele pega o IP do computador que está rodando o Expo (o mesmo que aparece no QR code) e usa a porta `8000`. Por isso, na maioria dos casos, **não é preciso configurar nada**, desde que a API tenha sido iniciada com `--host 0.0.0.0`.

Para usar outro endereço, copie o `.env.example` para `.env` e ajuste:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:8000
```

- No **celular**, use o IP do computador na rede, e não `localhost`: para o celular, `localhost` é o próprio celular.
- Variáveis que começam com `EXPO_PUBLIC_` são lidas pelo Expo e entram no app. Por isso nada secreto deve ir nelas (a chave do Supabase fica só no backend).
- Depois de mudar o `.env`, reinicie o `npx expo start`.

A lógica está em `src/services/api.js`:

```js
const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? '127.0.0.1';
const configuredBaseURL = process.env.EXPO_PUBLIC_API_URL?.trim();
export const apiBaseURL = (configuredBaseURL || `http://${host}:8000`).replace(/\/+$/, '');
```

### Rodando no navegador

O script `npm run web` existe, mas as bibliotecas do modo web (`react-dom` e `react-native-web`) **não estão instaladas** no projeto. Para usar o navegador, instale-as uma vez:

```bash
npx expo install react-dom react-native-web
```

A API já autoriza o endereço do Expo Web (`localhost:8081`) no CORS.

### Login de teste

O script `backend/banco_dados/criar_banco_teste.py` cria o aluno `teste@etec.com`, senha `teste123`. Para testar como professor ou gestão, use um usuário desse tipo cadastrado no banco.

---

## 2. Estrutura de pastas

```
frontend/
├── App.js                  # pilha de navegação: Login → Main (abas)
├── index.js                # ponto de entrada do Expo
├── app.json                # nome, ícones e plugins do app
├── .env.example            # modelo do endereço da API
├── assets/                 # imagens (logo, ícones, banners)
└── src/
    ├── navigation/
    │   └── MainTabs.js     # as abas do app e o usuário logado em cada uma
    ├── screens/            # uma pasta por tela
    │   ├── login/          LoginScreen.js
    │   ├── home/           HomeScreen.js
    │   ├── mural/          MuralScreen.js, avisosAtivos.js
    │   ├── boletim/        BoletimScreen.js, NotaModal.js, MencaoOptions.js, integracao_boletim.md
    │   ├── cantina/        CantinaScreen.js, integracao_cantina.md
    │   ├── reservas/       ReservasScreen.js, integracao_reservas.md
    │   └── atendimento/    AtendimentoScreen.js, AtendimentoModal.js, SolicitacaoEdicao.js
    ├── components/         # peças reaproveitáveis (EloTabBar, Select, ...)
    ├── services/
    │   ├── api.js          # a instância do Axios (endereço e tempo limite)
    │   ├── endpoints.js    # uma função para cada rota da API
    │   └── errors.js       # transforma um erro em mensagem para a tela
    └── styles/
        ├── global.js       # cores e espaçamentos do app inteiro
        ├── common.js       # estilos repetidos em várias telas (cabeçalho, botão principal)
        ├── components.js   # estilos dos componentes
        ├── navigation.js   # estilos da barra de abas
        └── screens/        # um arquivo de estilos por tela
```

Os arquivos `integracao_*.md` dentro das telas explicam, passo a passo, como cada tela foi ligada à API.

---

## 3. Telas e o que cada perfil vê

O perfil vem do campo `tipo` do usuário: `ALUNO`, `PROFESSOR` ou `GESTAO`.

| Tela (aba) | Aluno | Professor | Gestão |
|---|---|---|---|
| **Login** | Entra com e-mail e senha | igual | igual |
| **Início** | Saudação, "Seu dia na escola" com o aviso principal do mural, atalhos e a merenda de hoje | Igual, sem a merenda | Igual ao aluno |
| **Mural** | Lê os avisos, busca, passa pelo aviso em destaque | + publica avisos com imagens e data de expiração | + edita e exclui qualquer aviso |
| **Boletim** | Vê o próprio boletim: um cartão por disciplina, com a menção final de cada bimestre | Escolhe a turma → toca no aluno → escolhe a matéria (só as que dá aula) → lança, troca e exclui menções | Igual ao professor, com todas as matérias |
| **Merenda** | Vê os cardápios e responde "Comerá hoje?" | Aba escondida | Cadastra, edita e exclui cardápios e vê quantos alunos vão comer |
| **Reservas** | Vê a ocupação das salas por dia | + reserva salas (avulsa ou toda semana) e cancela as próprias | Igual ao professor |
| **Ajuda** (Atendimento) | Cria, edita e exclui as próprias solicitações e lê a resposta da escola | + vê um cartão por aluno que pediu algo e, no modal, responde, muda o status, edita ou exclui | Igual ao professor |

Detalhes de cada tela:

- **Início** (`HomeScreen.js`): o cartão "Seu dia na escola" mostra o mesmo aviso que está em destaque no Mural. A regra de quais avisos aparecem (ativos e não vencidos, do mais novo para o mais antigo) fica em `mural/avisosAtivos.js` e é usada pelas duas telas, para elas nunca discordarem.
- **Mural** (`MuralScreen.js`): as imagens são escolhidas na galeria, enviadas uma a uma para `POST /avisos/imagens` e só então o aviso é criado com os links.
- **Boletim** (`BoletimScreen.js` + `NotaModal.js`): o mesmo modal serve ao aluno (só leitura) e ao professor/gestão (com "Trocar menções", "Excluir" e "+ Lançar menções" nos bimestres vazios). O botão "+ Adicionar nota" lança a mesma menção para vários alunos de uma vez.
- **Reservas** (`ReservasScreen.js`): o dia é escolhido entre hoje e os próximos 6 dias, sem calendário. Cada sala mostra se está livre, reservada ou fora de uso no período escolhido.
- **Ajuda** (`AtendimentoScreen.js` + `AtendimentoModal.js`): os cartões de alunos aparecem conforme as solicitações chegam, com o aluno que pediu por último no topo.

---

## 4. Como o app fala com a API

São três camadas, cada uma com um papel:

```
Tela  ──▶  endpoints.js  ──▶  api.js (Axios)  ──▶  API (FastAPI)
  ▲                                                   │
  └──────── errors.js (mensagem para a tela) ◀────────┘ em caso de erro
```

### `api.js`: a instância do Axios

```js
const api = axios.create({
  baseURL: apiBaseURL,   // http://<ip>:8000
  timeout: 10000,        // desiste depois de 10 segundos
});
```

Configurada uma vez, usada pelo app inteiro.

### `endpoints.js`: uma função por rota

```js
export const reservasApi = {
  // filtros opcionais: { data, sala_id, usuario_id }
  list: (filtros) => api.get('/reservas', { params: filtros }),
  create: (reserva) => api.post('/reservas', reserva),
  remove: (reservaId) => api.delete(`/reservas/${reservaId}`),
};
```

A tela chama `reservasApi.list({ data: '2026-11-25' })` e não precisa saber o caminho da rota nem o método HTTP. Se uma rota mudar no backend, muda só esse arquivo.

### `errors.js`: a mensagem certa para o usuário

```js
export function getApiErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (error.message) return error.message;
  }
  ...
  return fallback;
}
```

A API sempre explica o erro em `{"detail": "..."}`, em português ("Essa sala já está reservada nesse horário"). Esta função tira essa mensagem do erro do Axios. Se a API nem respondeu (sem internet, servidor desligado), usa a mensagem do próprio Axios ou o texto padrão que a tela passou.

### O padrão de uma chamada numa tela

```js
async function loadDados() {
  setErrorMessage('');
  try {
    const { data } = await salasApi.list();
    setSalas(data);
  } catch (error) {
    setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar as salas.'));
  } finally {
    setLoading(false);
  }
}
```

- `try`: faz a chamada e guarda o resultado no estado da tela.
- `catch`: guarda a mensagem de erro para mostrar no lugar da lista.
- `finally`: roda nos dois casos; por isso o `setLoading(false)` fica nele, sem repetir.

---

## 5. Navegação e usuário logado

```
App.js (pilha)
├── Login
└── Main ── MainTabs.js (abas)
            ├── Início   ├── Boletim   ├── Mural
            ├── Merenda  ├── Reservas  └── Ajuda
```

- **Pilha (`native-stack`)** em `App.js`: o Login e o resto do app. Depois de entrar, `navigation.replace('Main', ...)` **troca** o Login pelas abas, então o botão "voltar" do Android não leva de volta ao login.
- **Abas (`bottom-tabs`)** em `MainTabs.js`: cada aba é uma tela. A barra de abas padrão fica escondida (`hiddenTabBar`) e cada tela desenha a própria barra, `EloTabBar`, com os ícones e o visual do elo. O professor não vê a aba Merenda e começa em Reservas.

### Como as telas sabem quem está logado

```js
// LoginScreen.js
navigation.replace('Main', { profile: profiles[data.tipo], user: data });

// MainTabs.js
const userParams = { profile: route.params?.profile, user: route.params?.user };
<Tab.Screen name="Boletim" component={BoletimScreen} initialParams={userParams} />

// em qualquer tela
const user = route.params?.user;
const isAluno = user?.tipo === 'ALUNO';
```

O usuário devolvido pelo `POST /login` viaja como **parâmetro de navegação** até as abas, e cada aba o lê de `route.params`. Ver [a decisão](#por-que-o-usuário-logado-vai-pelos-parâmetros-de-navegação-e-não-por-context-ou-asyncstorage).

---

## 6. Padrões usados nas telas

### Recarregar ao voltar para a tela: `useFocusEffect`

```js
useFocusEffect(
  useCallback(() => {
    let active = true;
    loadNotices(() => active);
    return () => { active = false; };
  }, []),
);
```

Nas abas, a tela não é destruída quando o usuário troca de aba, então um `useEffect` comum só rodaria na primeira vez. O `useFocusEffect` roda **toda vez que a aba volta a aparecer**: quem publicou um aviso e voltou ao Início já vê o aviso novo.

O `active` evita atualizar o estado de uma tela que o usuário já deixou enquanto a resposta ainda estava chegando.

### Confirmação no próprio cartão (e não `Alert.alert`)

```
[ Editar ]  [ Excluir ]   →   Excluir este aviso?  [ Não ]  [ Sim, excluir ]
```

Excluir sempre pede confirmação, mas **dentro do cartão**, nunca com `Alert.alert`: os botões do `Alert` não funcionam quando o app roda no navegador.

### Modais para detalhes

Boletim, Atendimento e o formulário do Mural usam `Modal` com `animationType="slide"`: a lista continua visível atrás, e fechar o modal volta exatamente onde o usuário estava. O modal lê os dados do **estado da tela**, então, depois de salvar, ele já mostra a versão atualizada sem precisar ser reaberto.

### Estados de carregamento, erro e vazio

Toda lista tem os quatro estados: **carregando** (`ActivityIndicator`), **erro** (a mensagem da API), **vazio** (um texto explicando, como "Nenhum aluno nessa turma.") e **com dados**.

### Componentes reaproveitados

- `EloTabBar`: a barra de abas com os ícones do elo, com a versão do professor (sem Merenda).
- `Select`: campo de seleção que abre uma lista, com opção de **várias** escolhas e "Selecionar todos" (usado para escolher os alunos no Boletim).
- `NotaModal`, `MencaoOptions`, `AtendimentoModal`, `SolicitacaoEdicao`: ficam na pasta da tela que os usa, porque só servem a ela.

---

## 7. Estilos

Os estilos ficam **fora das telas**, em `src/styles/`:

| Arquivo | Conteúdo |
|---|---|
| `global.js` | `colors` (primária, sucesso, alerta, perigo, ...) e `spacing` |
| `common.js` | `commonScreenStyles` (cabeçalho com a logo e o sino, título, subtítulo), `primaryButtonStyles` e `contentTopStyle` |
| `components.js` | estilos de `EloTabBar`, `Select` e dos outros componentes |
| `screens/<tela>.js` | os estilos de cada tela, que reaproveitam `commonScreenStyles` |

```js
export const muralStyles = {
  ...commonScreenStyles,         // cabeçalho, título... iguais em todas as telas
  ...StyleSheet.create({ ... }), // o que é só do mural
};
```

Assim o arquivo da tela fica só com a lógica e o JSX, e uma mudança de cor no `global.js` vale para o app inteiro. Cores que dependem de um valor, como a cor de cada menção (I vermelho, R laranja, B azul, MB verde) ou de cada status de atendimento, saem de funções como `createMencaoStyle(mencao)` e `statusStyle(status)`.

---

## 8. Decisões do projeto (e por quê)

### Por que React Native com Expo?

- **Um código, vários aparelhos.** O mesmo JavaScript vira app Android e iOS (e web, com as bibliotecas do modo web). A equipe não precisa aprender Kotlin e Swift.
- **Expo Go.** Para testar, basta ler o QR code; não é preciso instalar Android Studio nem Xcode, nem gerar um `.apk` a cada mudança. O app atualiza sozinho quando um arquivo é salvo.
- **Bibliotecas prontas e compatíveis.** `expo-image-picker` (galeria), `expo-constants` (descobrir o IP do computador) e os ícones vêm do mesmo ecossistema e já funcionam juntos.
- **React.** Os conceitos (componentes, `useState`, `useEffect`) são os mesmos do React para web.

### Por que Axios, e não `fetch`?

O `fetch` já vem no JavaScript e funcionaria, mas cada chamada precisaria de mais código. O que o Axios resolve:

| | `fetch` | Axios (como o projeto usa) |
|---|---|---|
| **Endereço base** | Repetir `http://<ip>:8000` em toda chamada, ou criar uma função própria | `axios.create({ baseURL })` uma vez, em `api.js` |
| **Tempo limite** | Não tem; é preciso montar com `AbortController` e `setTimeout` | `timeout: 10000`. Sem isso, com a API desligada, a tela ficaria carregando para sempre |
| **Erro HTTP (400, 404, 409...)** | **Não** cai no `catch`: a promessa dá certo e é preciso conferir `response.ok` em toda chamada | Cai no `catch` sozinho, com a resposta em `error.response` |
| **JSON** | `JSON.stringify` no envio, `await response.json()` na volta, e o cabeçalho `Content-Type` à mão | Automático: `api.post('/avisos', aviso)` e `const { data } = await ...` |
| **Filtros na URL** | Montar a *query string* à mão | `api.get('/notas', { params: { turma_id: 1 } })` vira `/notas?turma_id=1`, e os valores `undefined` são ignorados |
| **Saber se é erro da API** | Comparar formatos na mão | `axios.isAxiosError(error)`, usado em `errors.js` |

O ponto mais importante é o **erro HTTP**: o app depende de mostrar a mensagem do `detail` ("E-mail ou senha inválidos", "Essa sala já está reservada nesse horário"). Com o Axios, todo erro chega ao `catch` do mesmo jeito, e uma única função (`getApiErrorMessage`) trata todos. Com o `fetch`, cada chamada precisaria de um `if (!response.ok)`, e esquecer um deles faria a tela tratar um erro como se tivesse dado certo.

### Por que uma camada `endpoints.js`?

As telas nunca escrevem caminhos de rota. Se o backend renomear uma rota ou mudar um parâmetro, a correção é num lugar só, e as telas leem como frases (`notasApi.list({ turma_id })`).

### Por que React Navigation com pilha + abas?

É a biblioteca de navegação recomendada pelo Expo. A **pilha** separa o login do app (e o `replace` impede voltar ao login); as **abas** deixam as seções principais a um toque e mantêm o estado de cada uma ao trocar de aba.

### Por que uma barra de abas própria (`EloTabBar`)?

A barra padrão do React Navigation não tem o visual do elo (ícones em imagem, ativo e inativo, e a versão do professor sem a Merenda). Ela é escondida e cada tela desenha a `EloTabBar`.

### Por que o usuário logado vai pelos parâmetros de navegação (e não por Context ou AsyncStorage)?

É o caminho mais simples para o escopo do TCC: o login devolve o usuário e ele é repassado às abas, sem biblioteca nem estrutura extra. A consequência é que o usuário **só existe na memória**: ao fechar o app ou recarregar, é preciso entrar de novo. Isso também evita guardar dados pessoais no aparelho enquanto não existe um token de sessão (ver a limitação de autenticação no [README do backend](../backend/README.md#8-limitações-conhecidas)).

### Por que os estilos em arquivos separados?

Os arquivos das telas ficam menores e focados na lógica, os estilos comuns são escritos uma vez (`commonScreenStyles`), e as cores ficam centralizadas em `global.js`.

### Por que o upload de imagem passa pela API?

O app manda a imagem em base64 para `POST /avisos/imagens`, e é a API que salva no Storage. Assim o app não precisa da chave do Supabase, e a API confere tipo e tamanho (até 5 MB) antes de salvar. As imagens saem da galeria com `quality: 0.6`, para o envio ficar rápido.

---

## 9. Limitações conhecidas

- **O login não persiste.** Recarregar o app volta para a tela de login.
- **"Esqueceu a senha?"** e **"Precisa de ajuda para acessar?"** são só texto; ainda não fazem nada.
- **O sino de notificações** é só visual.
- **Substituição de professores, calendário/eventos e ocorrências** ainda não têm tela.
- **Componentes sem uso:** `AnnouncementItem`, `Avatar`, `AvisoCard`, `Button`, `Card`, `ClassCard`, `CommentItem`, `DayPill`, `Header`, `Loading`, `StatBox`, `SubjectRow` e `Tag` não são importados por nenhuma tela. Sobraram de versões anteriores e podem ser reaproveitados ou apagados.
- **Modo web** precisa das bibliotecas `react-dom` e `react-native-web` (ver [Rodando no navegador](#rodando-no-navegador)).
- **Reserva semanal** depende de um script SQL que ainda não foi rodado no banco (ver o [README do banco](../backend/banco_dados/README.md#3-scripts-de-alteração-migrations)).
