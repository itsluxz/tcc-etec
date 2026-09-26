# Portal Educacional — Status do Projeto

> Documento gerado a partir de uma análise do repositório em sua data de leitura. Reflete exclusivamente o que foi encontrado no código versionado em `https://github.com/itsluxz/tcc-etec` (clone raso do branch padrão, commit de merge `704ec65`). Nenhum código foi alterado, refatorado ou apagado durante esta análise.

## Descrição resumida

O **Portal Educacional** é um Trabalho de Conclusão de Curso (Técnico em Informática para Internet, ETEC "Rodrigues de Abreu", Bauru — 2026) que propõe uma plataforma web/mobile para centralizar a comunicação e a gestão de rotinas de uma escola: mural de avisos, cardápio, substituição de professores, reserva de salas/laboratórios, calendário acadêmico, canal de atendimento e painel de ocorrências/manutenção, servindo alunos, professores e gestão.

## Objetivo

Centralizar, em um único ambiente digital, a comunicação e a gestão de recursos escolares, reduzindo ruído de informação entre gestão, professores e alunos.

## Tecnologias

| Camada | Planejado (README) | Encontrado no código |
|---|---|---|
| Frontend | React Native, HTML, CSS | ✅ React Native 0.86.3 + Expo SDK 57, `@react-navigation` (native + native-stack) |
| Backend | Node.js, Python | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL — nenhum diretório/arquivo de backend existe no repositório |
| Banco de dados | PostgreSQL | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL — nenhuma migration, schema, seed ou string de conexão encontrada |
| Ferramentas auxiliares | VS Code, Git, GitHub, Expo Go | ✅ Repositório Git/GitHub ativo; projeto criado com Expo (compatível com Expo Go) |

## Status geral e progresso aproximado

**Status geral: EM DESENVOLVIMENTO (fase inicial / esqueleto)**

| Área | Progresso | Como foi calculado |
|---|---|---|
| Frontend | ~5% | Projeto Expo criado e configurado, navegação instalada, mas de 6 telas existentes, 5 têm arquivo vazio (0 bytes) e apenas 1 (Login) tem conteúdo — e mesmo essa é um placeholder ("Olá mundo!"), sem formulário, validação ou chamada de API |
| Backend | 0% | Nenhum arquivo, pasta, `package.json` de servidor, rota ou controller encontrado no repositório |
| Banco de dados | 0% | Nenhum schema, migration, seed, arquivo `.sql` ou ORM configurado encontrado |
| Integração frontend ↔ backend | 0% | Não há nenhuma chamada HTTP (`fetch`/`axios`), variável de ambiente de API ou cliente HTTP configurado no frontend |

Os percentuais são estimativas transparentes, calculadas pela proporção de arquivos com conteúdo real / total de arquivos esperados para cada camada, e pela ausência total de artefatos de backend/banco. Não há dados suficientes para medir "qualidade" de implementação além disso.

---

## 1. Estrutura do projeto

```
tcc-etec/
├── README.md                # Descrição geral do TCC
└── frontend/
    ├── AGENTS.md             # Guia de convenções para agentes de IA/devs (Expo Router, EAS, etc.)
    ├── App.js                # Ponto de entrada do app — configura o NavigationContainer
    ├── index.js              # Bootstrap do Expo (registerRootComponent)
    ├── app.json              # Configuração do Expo (nome, ícones, splash)
    ├── package.json / package-lock.json
    ├── LICENSE               # Licença MIT (herdada do template Expo)
    ├── assets/               # Ícones e splash screen padrão do Expo
    └── src/
        ├── components/
        │   ├── AvisoCard.js  # vazio (0 bytes)
        │   ├── Button.js     # vazio (0 bytes)
        │   ├── Header.js     # vazio (0 bytes)
        │   └── Loading.js    # vazio (0 bytes)
        └── screens/
            ├── login/LoginScreen.js      # única tela com conteúdo (17 linhas)
            ├── Home/HomeScreen.js        # vazio (0 bytes)
            ├── Mural/MuralScreen.js      # vazio (0 bytes)
            ├── Cantina/CantinaScreen.js  # vazio (0 bytes)
            ├── Salas/SalaScreen.js       # vazio (0 bytes)
            └── Boletim/boletim.js        # vazio (0 bytes)
```

Não existem diretórios `backend/`, `database/`, `docs/`, `api/` ou equivalentes no repositório.

### Arquitetura atual (real)

```
Frontend (React Native / Expo)
   ↓
   (nenhuma API / backend encontrado)
   ↓
   (nenhum banco de dados encontrado)
```

A arquitetura planejada (Frontend → API/Backend em Node.js/Python → PostgreSQL) **ainda não existe no repositório**. Atualmente o projeto é apenas o esqueleto do cliente mobile, sem nenhuma camada de servidor ou persistência implementada ou versionada.

---

## 2. Telas do sistema

| Tela | Usuário | Status | Objetivo |
|---|---|---|---|
| Login | Todos | 🟡 PARCIALMENTE IMPLEMENTADO | Autenticar o usuário no sistema |
| Home | Todos | 🔴 PENDENTE | Tela inicial após login (arquivo vazio) |
| Mural | Todos | 🔴 PENDENTE | Exibir avisos da escola (arquivo vazio) |
| Cantina (Cardápio) | Todos | 🔴 PENDENTE | Consultar cardápio diário (arquivo vazio) |
| Salas | Professor/Gestão | 🔴 PENDENTE | Reservar/consultar salas e laboratórios (arquivo vazio) |
| Boletim | Aluno | 🔴 PENDENTE | Não descrito no escopo original do README; existe como pasta/arquivo vazio — objetivo real ❓ A DEFINIR |
| Substituições | Todos | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL | Planejada no README, sem pasta/arquivo correspondente |
| Atendimento | Todos | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL | Planejada no README, sem pasta/arquivo correspondente |
| Ocorrências | Gestão | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL | Planejada no README, sem pasta/arquivo correspondente |
| Painel de Gestão | Gestão | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL | Planejada no README, sem pasta/arquivo correspondente |
| Perfil/Configurações | Todos | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL | Não mencionada explicitamente; não encontrada |

### Detalhe — Login (`frontend/src/screens/login/LoginScreen.js`)
- **Status:** 🟡 PARCIALMENTE IMPLEMENTADO
- **Implementado:** componente funcional renderizável, importa `SafeAreaProvider`, está registrado como única rota (`"Login"`) no `Stack.Navigator` em `App.js`.
- **Pendente:** não há campos de usuário/senha, nenhum estado (`useState`), nenhuma chamada de API, nenhuma navegação para outra tela, nenhuma validação, nenhum tratamento de erro. O conteúdo visual é apenas um texto estático "Olá mundo!".
- **Observação:** é a única tela referenciada em `App.js`; as demais telas existem como arquivos, mas **não estão registradas em nenhum navegador**, ou seja, mesmo que tivessem conteúdo, não seriam alcançáveis pela navegação atual.

### Demais telas (`Home`, `Mural`, `Cantina`, `Salas`, `Boletim`)
- **Status:** 🔴 PENDENTE
- Todos os cinco arquivos (`HomeScreen.js`, `MuralScreen.js`, `CantinaScreen.js`, `SalaScreen.js`, `boletim.js`) têm **0 bytes** — apenas o nome/local do arquivo foi criado, sem nenhum código.

---

## 3. Funcionalidades

| Módulo | Item | Status |
|---|---|---|
| **Autenticação** | Tela de login | 🟡 (placeholder visual, sem lógica) |
| | Logout | 🔴 PENDENTE |
| | JWT/token | 🔴 PENDENTE |
| | Persistência de sessão | 🔴 PENDENTE |
| | Recuperação de senha | 🔴 PENDENTE |
| | Controle de acesso | 🔴 PENDENTE |
| **Mural de avisos** | Listagem/Criação/Edição/Exclusão | 🔴 PENDENTE (arquivo de tela e `AvisoCard.js` vazios) |
| | Notificações / direcionamento por perfil | 🔴 PENDENTE |
| **Cardápio** | Consulta/Cadastro/Edição/Exclusão/Histórico | 🔴 PENDENTE (`CantinaScreen.js` vazio) |
| **Substituição de professores** | Cadastro/Consulta/Edição/Exclusão/Filtros | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL |
| **Salas e laboratórios** | Listagem/Disponibilidade/Reserva/Cancelamento/Aprovação/Conflitos | 🔴 PENDENTE (`SalaScreen.js` vazio) |
| **Calendário** | Eventos/Provas/Feriados/Reuniões | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL |
| **Atendimento** | Criação/Consulta/Resposta/Status/Histórico | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL |
| **Ocorrências** | Criação/Prioridade/Status/Responsável/Resolução/Histórico | ⚠️ NÃO IDENTIFICADO NO CÓDIGO ATUAL |
| **Notificações** | Internas/Tempo real/Push/WebSocket | 🔴 PENDENTE (nenhuma dependência de notificações ou socket instalada) |

---

## 4. Backend / API

⚠️ **NÃO IDENTIFICADO NO CÓDIGO ATUAL.**

Não há framework de servidor, ponto de entrada de API, conexão com banco, middlewares, controllers, services, rotas, validações ou tratamento de erros no repositório. Não existe `package.json` de backend, nem estrutura em Node.js ou Python.

| Endpoint | Método | Objetivo | Status | Arquivo |
|---|---|---|---|---|
| — | — | — | ⚠️ Nenhum endpoint encontrado | — |

Os endpoints citados como referência no planejamento (`/api/auth/login`, `/api/avisos`, `/api/cardapio`, `/api/eventos`, `/api/salas`, `/api/reservas`, `/api/substituicoes`, `/api/atendimentos`, `/api/ocorrencias`) **não possuem nenhuma evidência de implementação** no repositório atual.

---

## 5. Banco de dados

⚠️ **NÃO IDENTIFICADO NO CÓDIGO ATUAL.**

Não há arquivos de schema, migrations, seeds, ORM (Prisma/Sequelize/TypeORM/SQLAlchemy) ou string de conexão com PostgreSQL em nenhuma parte do repositório.

| Tabela | Status |
|---|---|
| usuarios | ❓ PLANEJADO (não implementado) |
| avisos | ❓ PLANEJADO (não implementado) |
| cardapios | ❓ PLANEJADO (não implementado) |
| salas | ❓ PLANEJADO (não implementado) |
| reservas | ❓ PLANEJADO (não implementado) |
| eventos | ❓ PLANEJADO (não implementado) |
| substituicoes | ❓ PLANEJADO (não implementado) |
| atendimentos | ❓ PLANEJADO (não implementado) |
| ocorrencias | ❓ PLANEJADO (não implementado) |

Todas as tabelas acima são apenas o **modelo planejado** descrito no escopo do TCC; nenhuma foi encontrada como **implementada** no código.

---

## 6. Perfis de usuário

Os perfis (ALUNO, PROFESSOR, GESTÃO) são descritos apenas no README/escopo do projeto. **Nenhum controle de perfil, papel (`role`) ou permissão foi encontrado no código** — não há autenticação real, logo também não há diferenciação de acesso implementada.

| Perfil | Permissões planejadas | Implementado? |
|---|---|---|
| ALUNO | Visualizar avisos, cardápio, calendário; consultar substituições; abrir atendimento; registrar ocorrência (se permitido) | 🔴 PENDENTE |
| PROFESSOR | Idem ao aluno + reservar salas/laboratórios | 🔴 PENDENTE |
| GESTÃO | Criar/gerenciar avisos, cardápio, calendário, substituições, reservas; responder atendimentos; gerenciar ocorrências; painel administrativo | 🔴 PENDENTE |

## 7. Matriz de permissões

Não é possível validar a matriz abaixo contra o código, pois **não existe controle de acesso implementado**. Ela é reproduzida apenas como referência do planejamento (README/escopo), não como estado real:

| Funcionalidade | Aluno | Professor | Gestão |
|---|---|---|---|
| Visualizar avisos | ? | ? | ? |
| Criar avisos | ? | ? | ? |
| Editar avisos | ? | ? | ? |
| Visualizar cardápio | ? | ? | ? |
| Cadastrar cardápio | ? | ? | ? |
| Visualizar calendário | ? | ? | ? |
| Criar eventos | ? | ? | ? |
| Reservar sala | ? | ? | ? |
| Gerenciar reservas | ? | ? | ? |
| Consultar substituições | ? | ? | ? |
| Criar substituição | ? | ? | ? |
| Abrir atendimento | ? | ? | ? |
| Responder atendimento | ? | ? | ? |
| Criar ocorrência | ? | ? | ? |
| Gerenciar ocorrências | ? | ? | ? |

`?` = ainda não definido/implementado no código (nenhuma linha desta matriz possui evidência no repositório atual).

---

## 8. Regras de negócio

| ID | Regra | Módulo | Status | Evidência |
|---|---|---|---|---|
| RN-01 | Usuário precisa estar autenticado para acessar áreas restritas | Autenticação | 🔴 PENDENTE | Nenhuma lógica de sessão/token encontrada |
| RN-02 | Usuário possui um perfil (aluno/professor/gestão) que define suas permissões | Autenticação | ❓ A DEFINIR | Não implementado; não há modelo de usuário no código |
| RN-03 | Endpoints privados devem validar autenticação | Autenticação | ⚠️ NÃO IDENTIFICADO | Não há endpoints no repositório |
| RN-04 | Senhas não devem ser armazenadas em texto puro | Autenticação | ❓ A DEFINIR | Não há persistência de usuários implementada |
| RN-05 | Uma sala não deve possuir duas reservas conflitantes | Reservas | ❓ A DEFINIR | Módulo de reservas inexistente no código |
| RN-06 | Regras de expiração/direcionamento de avisos por perfil | Mural | ❓ A DEFINIR | Módulo de mural inexistente no código (`MuralScreen.js` e `AvisoCard.js` vazios) |
| RN-07 | Regras de cadastro/edição do cardápio (um cardápio por data, feriados, dias sem aula) | Cardápio | ❓ A DEFINIR | Módulo de cardápio inexistente no código |
| RN-08 | Conflitos de horário em substituições de professores | Substituições | ❓ A DEFINIR | Módulo inexistente no repositório |
| RN-09 | Fluxo de abertura/resposta/encerramento/reabertura de atendimento | Atendimento | ❓ A DEFINIR | Módulo inexistente no repositório |
| RN-10 | Prioridade, responsável e resolução de ocorrências | Ocorrências | ❓ A DEFINIR | Módulo inexistente no repositório |

Nenhuma regra de negócio acima possui implementação real no código — todas dependem de módulos (backend, banco, telas funcionais) que ainda não existem no repositório.

---

## 9. Glossário

| Termo | Definição |
|---|---|
| Portal Educacional | Nome do sistema/TCC descrito neste repositório |
| Aluno | Perfil de usuário estudante da escola |
| Professor | Perfil de usuário docente da escola |
| Gestão | Perfil de usuário administrativo/direção da escola |
| Mural | Módulo planejado para exibição de avisos escolares |
| Aviso | Item de conteúdo publicado no Mural |
| Cardápio | Módulo/planejado para consulta da merenda escolar (chamado "Cantina" no código) |
| Substituição | Registro de troca de professor titular por substituto |
| Reserva | Agendamento de uso de sala/laboratório |
| Sala / Laboratório | Espaço físico da escola reservável |
| Atendimento | Canal digital de dúvidas/solicitações |
| Ocorrência | Registro de incidente ou solicitação de manutenção |
| Evento | Item do calendário acadêmico (prova, feriado, reunião, etc.) |
| Boletim | Tela/pasta encontrada no código (`boletim.js`), sem descrição no escopo original — provável módulo de notas/desempenho acadêmico, mas isso é uma suposição; objetivo real ❓ A DEFINIR |
| Cantina | Nome usado no código (`CantinaScreen.js`) para o módulo de Cardápio |
| JWT | JSON Web Token — mecanismo de autenticação planejado, não implementado |
| API | Interface de Programação de Aplicações — não implementada neste repositório |
| Endpoint | Rota de uma API — nenhum encontrado |
| CRUD | Create, Read, Update, Delete — operações básicas de dados |
| Middleware | Camada intermediária de processamento de requisições — não implementada |
| PostgreSQL | Banco de dados relacional planejado — não implementado |
| Frontend | Camada de interface do usuário — parcialmente presente (esqueleto Expo) |
| Backend | Camada de servidor/API — ausente no repositório |
| Token | Credencial de sessão — não implementada |
| WebSocket | Protocolo para comunicação em tempo real — planejado, não implementado |
| Push Notification | Notificação enviada ao dispositivo do usuário — planejada, não implementada |

---

## 10. ⚠️ Armadilhas e pontos de atenção

- **Sem backend real:** qualquer regra de autorização (quem pode ver/criar/editar) hoje só pode existir no frontend, o que **nunca deve ser considerado seguro**. Quando o backend for criado, toda validação de perfil e permissão precisa ser reforçada no servidor, nunca confiando no que o app cliente envia.
- **Telas vazias não são "mock":** diferente do exemplo clássico de mock (`const avisos = [...]` fixo no componente), aqui as telas (`HomeScreen.js`, `MuralScreen.js`, `CantinaScreen.js`, `SalaScreen.js`, `boletim.js`) estão **totalmente vazias** (0 bytes) — ou seja, nem chegam ao estágio de "mockado", estão em branco.
- **Navegação incompleta:** `App.js` registra apenas a rota `"Login"` no `Stack.Navigator`. As demais telas existem como arquivos soltos, mas não estão conectadas à navegação — mesmo que ganhassem conteúdo, não seriam acessíveis sem alterar `App.js`.
- **Nomenclatura divergente:** o README fala em "Cardápio", mas o código usa a pasta/tela `Cantina` (`CantinaScreen.js`). Definir qual nome será o padrão evita confusão futura entre documentação, código e possível API.
- **Tela "Boletim" fora do escopo original:** não é mencionada no README como funcionalidade do projeto; sua existência sugere uma funcionalidade adicional não documentada — vale confirmar com a equipe se é uma inclusão nova ou resquício.
- **Dependências:** o projeto usa Expo SDK 57 (`~57.0.25`) com React 19.2.3 e React Native 0.86.3 — versões recentes; ao trabalhar nelas, **não confiar em conhecimento de treinamento desatualizado sobre Expo/React Native** (o próprio `frontend/AGENTS.md` do repositório já alerta para isso e recomenda consultar a documentação oficial versionada antes de qualquer alteração).
- **Ausência de variáveis de ambiente:** não há arquivo `.env`/`.env.example` no repositório; quando a API for criada, será necessário definir onde essas variáveis (URL da API, segredos JWT etc.) ficarão, e garantir que nunca sejam versionadas.
- **Dados de teste:** não há mocks, seeds, fixtures ou usuários de teste no código atual.
- **Código duplicado:** não aplicável ainda, dado o volume mínimo de código existente.

---

## 11. Decisões de negócio pendentes

- ❓ Professor precisa de aprovação para reservar sala?
- ❓ Professor pode cancelar uma reserva?
- ❓ Quantos dias antes uma reserva pode ser feita?
- ❓ Aluno pode registrar ocorrência?
- ❓ Quais níveis de prioridade existem para ocorrências?
- ❓ Quais status existem no atendimento?
- ❓ Atendimento encerrado pode ser reaberto?
- ❓ Aviso pode ser direcionado a apenas determinado perfil?
- ❓ Aviso possui data de expiração?
- ❓ Existe histórico de alterações (avisos, reservas, ocorrências)?
- ❓ Gestão pode editar ocorrências/atendimentos de outros usuários?
- ❓ Uma substituição pode possuir múltiplos substitutos?
- ❓ Haverá push notifications?
- ❓ Haverá notificações em tempo real (WebSocket/Socket.IO)?
- ❓ Qual é a finalidade real da tela "Boletim" encontrada no código, já que não consta no escopo do README?
- ❓ O backend será feito em Node.js, Python, ou os dois (como o README sugere de forma ambígua)?

---

## 12. Inconsistências encontradas

| # | Problema | Localização | Impacto possível | Status |
|---|---|---|---|---|
| 1 | README chama o módulo de "Cardápio diário da merenda", código nomeia a pasta/tela como "Cantina" (`CantinaScreen.js`) | `README.md` vs `frontend/src/screens/Cantina/` | Confusão de nomenclatura entre documentação, código e futura API/banco | 🔴 Não corrigido (fora do escopo desta análise) |
| 2 | Tela "Boletim" existe no código mas não é citada no README/escopo do projeto | `frontend/src/screens/Boletim/boletim.js` | Funcionalidade não documentada pode gerar retrabalho ou dúvida sobre escopo | ❓ A DEFINIR |
| 3 | README cita stack de backend (Node.js e/ou Python) e banco (PostgreSQL), mas nenhum dos dois existe no repositório | `README.md` vs raiz do repositório | Divergência entre planejamento documentado e implementação real | 🔴 Pendente |
| 4 | Telas Calendário, Substituições, Atendimento, Ocorrências e Painel de Gestão são citadas no README, mas não têm nenhuma pasta/arquivo correspondente no frontend | `README.md` vs `frontend/src/screens/` | Escopo do README mais amplo que o código atual | 🔴 Pendente |
| 5 | Arquivo `boletim.js` usa nome de arquivo em minúsculo, enquanto as demais telas seguem o padrão `NomeScreen.js` | `frontend/src/screens/Boletim/boletim.js` | Inconsistência de convenção de nomenclatura de arquivos | 🔴 Não corrigido (fora do escopo desta análise) |

---

## 13. Checklist de desenvolvimento

**Preparação**
- [x] Repositório Git configurado
- [x] Frontend configurado (Expo + React Native + navegação)
- [ ] Backend configurado
- [ ] PostgreSQL configurado

**Autenticação**
- [~] Tela de login (placeholder visual, sem lógica)
- [ ] Endpoint de login
- [ ] Hash de senha
- [ ] JWT
- [ ] Persistência da sessão
- [ ] Controle de acesso

**Mural**
- [ ] Tela (arquivo vazio)
- [ ] API
- [ ] Banco
- [ ] CRUD
- [ ] Notificações

**Cardápio (Cantina)**
- [ ] Tela (arquivo vazio)
- [ ] API
- [ ] Banco
- [ ] Cadastro
- [ ] Consulta

**Calendário**
- [ ] Tela
- [ ] API
- [ ] Banco
- [ ] Eventos
- [ ] Filtros

**Reservas (Salas)**
- [ ] Tela (arquivo vazio)
- [ ] API
- [ ] Banco
- [ ] Verificação de conflitos
- [ ] Cancelamento
- [ ] Aprovação, se necessária

**Substituições**
- [ ] Tela
- [ ] API
- [ ] Banco
- [ ] Cadastro
- [ ] Consulta

**Atendimento**
- [ ] Tela do usuário
- [ ] Tela da gestão
- [ ] API
- [ ] Banco
- [ ] Status
- [ ] Resposta
- [ ] Histórico

**Ocorrências**
- [ ] Criação
- [ ] Gestão
- [ ] Status
- [ ] Prioridade
- [ ] Responsável
- [ ] Histórico

**Notificações**
- [ ] Notificações internas
- [ ] Tempo real
- [ ] Push notifications

---

## 14. Funcionalidades planejadas (ordem sugerida)

**Prioridade 1 — Base**
- Criar estrutura de backend (definir Node.js e/ou Python)
- Modelar e criar o banco de dados PostgreSQL
- Implementar autenticação (login, JWT, hash de senha)
- Implementar autorização/controle de acesso por perfil
- Conectar a navegação do app às demais telas já existentes como arquivos
- Estabelecer a integração frontend/backend (cliente HTTP, tratamento de erros, loading)

**Prioridade 2 — Funcionalidades principais**
- Mural de avisos
- Cardápio (Cantina)
- Calendário acadêmico
- Substituição de professores
- Reserva de salas/laboratórios
- Canal de atendimento
- Registro de ocorrências

**Prioridade 3 — Recursos avançados**
- Notificações (internas, tempo real, push)
- Dashboard/Painel de gestão
- Filtros avançados e pesquisa
- Relatórios e métricas

---

## 15. Integração Frontend ↔ Backend

⚠️ **Inexistente no momento.** Não há cliente HTTP (Axios/Fetch configurado), variável de ambiente de URL de API, headers de autenticação, tratamento de erro de rede ou estado de loading no frontend. Todas as telas, quando implementadas, ainda dependerão de:
- definição da URL base da API;
- escolha do cliente HTTP;
- estratégia de armazenamento do token (ex.: `expo-secure-store`);
- padronização de tratamento de erros e estados de carregamento.

Nenhuma tela hoje usa dados reais ou mockados — a única tela com conteúdo (Login) não faz nenhuma chamada de rede.

---

## 16. Como continuar o desenvolvimento

1. **Definir a stack de backend** entre as duas citadas no README (Node.js e/ou Python) — hoje a ambiguidade é uma decisão pendente crítica, pois toda a Prioridade 1 depende disso.
2. **Modelar o banco de dados** (MER mencionado no README, feito no BrModelo) e criar as migrations/schemas reais no PostgreSQL, cobrindo pelo menos: usuários, avisos, cardápios, salas, reservas, eventos, substituições, atendimentos e ocorrências.
3. **Implementar a API de autenticação** (login, hash de senha, emissão de JWT) e só então integrar com a tela `LoginScreen.js`, adicionando campos de formulário, estado e chamada de API.
4. **Registrar as telas já existentes** (`HomeScreen`, `MuralScreen`, `CantinaScreen`, `SalaScreen`, `boletim`) no `Stack.Navigator` de `App.js`, mesmo que inicialmente com conteúdo simples, para validar o fluxo de navegação ponta a ponta.
5. **Confirmar com a equipe/orientação** as decisões de negócio pendentes listadas na Seção 11 antes de implementar as regras de reservas, atendimento e ocorrências, para evitar retrabalho.
6. **Esclarecer o escopo da tela "Boletim"**, já que não consta no README — decidir se será mantida, removida ou documentada oficialmente.
7. **Padronizar nomenclatura** entre "Cardápio" (README) e "Cantina" (código) antes de criar os respectivos endpoints e tabelas, para evitar a inconsistência já registrada na Seção 12.
8. Ao trabalhar no frontend, seguir as orientações do próprio `frontend/AGENTS.md` do repositório: conferir a versão do Expo instalada e consultar a documentação oficial versionada antes de usar qualquer API do Expo/React Native, já que a stack é recente (Expo ~57, React 19, React Native 0.86).

---

## 17. Observação final

Este repositório representa o **estágio inicial** de um projeto de TCC: o planejamento (README) é significativamente mais amplo do que o que está implementado. Até o momento desta análise, existe apenas o esqueleto do aplicativo mobile (Expo/React Native), com uma tela de login em estado de placeholder e cinco outras telas criadas como arquivos vazios; não há nenhum código de backend, banco de dados, autenticação real ou integração de API no repositório. Todas as regras de negócio, endpoints e tabelas descritos neste documento fora da seção de planejamento são, portanto, **inferências do escopo do TCC**, não implementações confirmadas.
