# AGENTS.md — Portal Educacional

Este documento é a única fonte de verdade sobre escopo, arquitetura e ordem de implementação deste projeto. Qualquer agente (humano ou IA) que for gerar código para este repositório deve consultar este arquivo antes de codar.

## Regra geral (obrigatória)

- **Não implementar nada além do que está descrito neste documento.** Se uma funcionalidade, tabela, rota, biblioteca ou tecnologia não estiver listada aqui, ela não deve ser criada sem que o usuário peça explicitamente.
- **Seguir a ordem de fases da seção "Ordem de implementação".** Não adiantar funcionalidades de fases futuras (ex.: não implementar WebSocket/tempo real antes da Fase 5).
- **Não adicionar Python** nem qualquer outro backend/linguagem além de Node.js na v1.
- **Não inventar tabelas, colunas ou rotas extras** além das definidas neste arquivo. Se algo parecer necessário e estiver faltando, perguntar ao usuário antes de criar.
- Manter a estrutura de pastas exatamente como especificada abaixo.

## Stack

- Frontend: **React Native + Expo**
- Backend: **Node.js + Express**
- Banco de dados: **PostgreSQL**
- Autenticação: **JWT** (jsonwebtoken) + **bcrypt** para senhas
- Pacotes backend: `express`, `cors`, `dotenv`, `pg`, `bcrypt`, `jsonwebtoken`
- Navegação frontend: `@react-navigation/native`, `react-native-screens`, `react-native-safe-area-context`, `@react-navigation/native-stack`
- Python fica **fora do escopo da v1** (só cogitar depois, para análise de dados/automações, se pedido).

## Perfis de usuário e módulos

### Aluno
- Login
- Mural
- Cardápio
- Calendário
- Substituições (consulta)
- Atendimento

### Professor
- Login
- Mural
- Cardápio
- Calendário
- Minhas substituições
- Reserva de sala/laboratório
- Atendimento

### Gestão
- Login
- Mural (criar/editar)
- Cardápio (cadastrar)
- Calendário (cadastrar eventos)
- Substituições (cadastrar)
- Salas/Laboratórios (gerenciar reservas)
- Atendimento (responder)
- Ocorrências/Manutenção (gerenciar)

## Estrutura de pastas

```
portal-educacional/
│
├── frontend/
│   ├── src/
│   │   ├── components/        (Header.js, Button.js, AvisoCard.js, Loading.js)
│   │   ├── screens/
│   │   │   ├── Login/LoginScreen.js
│   │   │   ├── Home/HomeScreen.js
│   │   │   ├── Mural/MuralScreen.js
│   │   │   ├── Cardapio/CardapioScreen.js
│   │   │   ├── Calendario/CalendarioScreen.js
│   │   │   ├── Salas/SalasScreen.js
│   │   │   └── Atendimento/AtendimentoScreen.js
│   │   ├── navigation/AppNavigator.js
│   │   ├── services/api.js
│   │   └── context/AuthContext.js
│   ├── App.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── database.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── avisos.routes.js
│   │   │   ├── cardapio.routes.js
│   │   │   ├── calendario.routes.js
│   │   │   ├── salas.routes.js
│   │   │   ├── substituicoes.routes.js
│   │   │   ├── atendimento.routes.js
│   │   │   └── ocorrencias.routes.js
│   │   ├── controllers/
│   │   └── middlewares/
│   ├── .env   (NUNCA versionar — adicionar ao .gitignore)
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── .gitignore
└── README.md
```

### Variáveis de ambiente (`.env`)

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_educacional
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=uma_chave_secreta
```

## Esquema do banco de dados (PostgreSQL)

Não criar tabelas fora desta lista.

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- ALUNO | PROFESSOR | GESTAO
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE avisos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    autor_id INTEGER REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE cardapios (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE salas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    capacidade INTEGER,
    disponivel BOOLEAN DEFAULT TRUE
);

CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    sala_id INTEGER REFERENCES salas(id),
    professor_id INTEGER REFERENCES usuarios(id),
    data DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    finalidade TEXT,
    status VARCHAR(30) DEFAULT 'PENDENTE'
);

CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP,
    tipo VARCHAR(50) -- PROVA | FERIADO | EVENTO | REUNIAO
);

CREATE TABLE substituicoes (
    id SERIAL PRIMARY KEY,
    professor_ausente_id INTEGER REFERENCES usuarios(id),
    professor_substituto_id INTEGER REFERENCES usuarios(id),
    data DATE NOT NULL,
    horario_inicio TIME,
    horario_fim TIME,
    turma VARCHAR(100),
    disciplina VARCHAR(100),
    observacao TEXT
);

CREATE TABLE atendimentos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    assunto VARCHAR(200),
    descricao TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'ABERTO', -- ABERTO | RESPONDIDO
    resposta TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP
);

CREATE TABLE ocorrencias (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    local VARCHAR(150),
    titulo VARCHAR(200),
    descricao TEXT,
    prioridade VARCHAR(30),
    status VARCHAR(30) DEFAULT 'ABERTA', -- ABERTA | ASSUMIDA | RESOLVIDA
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Regra de negócio obrigatória
- **Reservas de sala não podem se sobrepor**: o backend deve validar, antes de criar uma reserva, se já existe outra reserva para a mesma `sala_id` com intervalo de horário conflitante na mesma `data`. Rejeitar a criação se houver conflito.

## Rotas da API

Não criar rotas fora desta lista.

```
POST /api/auth/login

GET /api/usuarios
GET /api/usuarios:id

POST /api/usuarios

PUT /api/usuarios 
PUT /api/usuarios:id

DELETE /api/usuarios:id

GET  /api/avisos
GET  /api/avisos/:id

GET  /api/cardapio
GET  /api/cardapio/:data

GET  /api/eventos

GET  /api/salas
POST /api/reservas

GET  /api/substituicoes

POST /api/atendimentos
GET  /api/atendimentos

POST /api/ocorrencias
GET  /api/ocorrencias
```

(Rotas de criação/edição para Mural, Cardápio e Eventos existem apenas para o perfil GESTAO — ver seção de permissões.)

## Autenticação

Fluxo:
1. Cliente envia `email` + `senha` para `POST /api/auth/login`.
2. Backend verifica o usuário, compara a senha com bcrypt.
3. Backend gera um JWT e retorna:
```json
{
    "token": "eyJhbGciOiJIUzI1Ni...",
    "usuario": {
        "id": 15,
        "nome": "João",
        "tipo": "ALUNO"
    }
}
```
4. O app armazena o token e envia em toda requisição autenticada:
```
Authorization: Bearer TOKEN
```

## Permissões por perfil

**ALUNO** pode:
- visualizar avisos
- visualizar cardápio
- visualizar calendário
- visualizar substituições
- abrir atendimento

**PROFESSOR** pode:
- visualizar avisos
- visualizar cardápio
- visualizar calendário
- consultar substituições
- reservar salas
- abrir atendimento

**GESTAO** pode:
- criar/editar avisos
- cadastrar cardápio
- cadastrar eventos
- gerenciar reservas
- cadastrar substituições
- responder atendimentos
- gerenciar ocorrências

Qualquer middleware de autorização deve checar o campo `tipo` do usuário autenticado (via JWT) contra esta lista antes de permitir a ação.

## Ordem de implementação (seguir estritamente, sem pular fases)

### Fase 1 — Preparação
- [ ] Criar repositório GitHub
- [ ] Criar frontend (`npx create-expo-app@latest frontend`)
- [ ] Criar backend (`npm init -y` + `express`)
- [ ] Instalar PostgreSQL
- [ ] Criar banco `portal_educacional`

### Fase 2 — Backend
- [ ] Configurar Express (`server.js`, `cors`, `express.json`)
- [ ] Configurar conexão PostgreSQL (`database.js`, pacote `pg`)
- [ ] Criar tabelas (schema acima)
- [ ] Criar rotas da API
- [ ] Criar autenticação (login + bcrypt)
- [ ] Criar geração/validação de JWT
- [ ] Criar middleware de permissões por `tipo`

### Fase 3 — Frontend
- [ ] Criar navegação (`AppNavigator.js`)
- [ ] Criar tela de Login (pode começar com login fictício antes de integrar ao backend)
- [ ] Criar Home (grid de módulos por perfil)
- [ ] Criar Mural (consumindo `GET /api/avisos`)
- [ ] Criar Cardápio
- [ ] Criar Calendário

### Fase 4 — Funcionalidades
- [ ] Reservas (com validação de conflito de horário)
- [ ] Substituições
- [ ] Atendimento
- [ ] Ocorrências

### Fase 5 — Recursos avançados (só depois das fases 1–4 estarem funcionando)
- [ ] Notificações (WebSocket/Socket.IO)
- [ ] Atualização em tempo real
- [ ] Dashboard da gestão
- [ ] Filtros
- [ ] Pesquisa

### Fase 6 — Finalização
- [ ] Validações
- [ ] Tratamento de erros
- [ ] Segurança
- [ ] Testes
- [ ] Responsividade
- [ ] Documentação
- [ ] Deploy

## Checklist rápido para qualquer agente antes de gerar código

1. A funcionalidade pedida está em alguma fase acima? Se não, parar e perguntar ao usuário.
2. A fase atual já foi concluída antes desta? Se não, sinalizar que está fora de ordem.
3. A tabela/rota/biblioteca que vou usar está listada neste arquivo? Se não, não usar sem confirmação.
4. Estou seguindo a estrutura de pastas definida? Não criar pastas/arquivos fora dela sem necessidade.
