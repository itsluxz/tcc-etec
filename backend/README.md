# elo — Backend (API)

API REST do **elo**, o Portal Educacional do TCC. Ela recebe os pedidos do aplicativo (frontend), valida os dados, aplica as regras da escola (quem pode reservar sala, como se calcula a menção final, etc.) e conversa com o banco de dados PostgreSQL hospedado no Supabase.

- **Linguagem:** Python 3.14
- **Framework:** FastAPI
- **Banco:** PostgreSQL no Supabase (acessado pela biblioteca `supabase`)
- **Servidor:** Uvicorn

Os outros documentos do projeto:
- [`../frontend/README.md`](../frontend/README.md): o aplicativo (React Native + Expo).
- [`banco_dados/README.md`](banco_dados/README.md): as tabelas e todos os comandos SQL usados no banco.
- [`notas/decisao_boletim.md`](notas/decisao_boletim.md): as decisões do boletim (menções, turmas, disciplinas) em detalhe.

---

## Sumário

1. [Como rodar](#1-como-rodar)
2. [Estrutura de pastas](#2-estrutura-de-pastas)
3. [Como uma requisição funciona](#3-como-uma-requisição-funciona)
4. [Rotas](#4-rotas)
5. [Padrões usados em todas as rotas](#5-padrões-usados-em-todas-as-rotas)
6. [Regras de negócio](#6-regras-de-negócio)
7. [Decisões do projeto (e por quê)](#7-decisões-do-projeto-e-por-quê)
8. [Limitações conhecidas](#8-limitações-conhecidas)

---

## 1. Como rodar

### Pré-requisitos

- Python 3.10 ou mais novo (o código usa `int | None`, que exige o 3.10; o projeto é desenvolvido no 3.14)
- O arquivo `.env` com as chaves do Supabase (peça para alguém da equipe; ele **não** vai para o Git)

### Passo a passo (Windows)

```bash
cd backend
python -m venv .venv
```

```bash
.venv\Scripts\activate
```

```bash
pip install -r requirements.txt
```

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- `--reload` reinicia o servidor sozinho quando um arquivo `.py` é salvo.
- `--host 0.0.0.0` deixa a API acessível por outros aparelhos da mesma rede, que é o caso do celular com o Expo Go. Sem ele, só o próprio computador consegue chamar a API.
- `--port 8000` é a porta que o frontend espera por padrão.

No macOS/Linux, a ativação do ambiente é `source .venv/bin/activate`.

### O arquivo `.env`

```env
SUPABASE_URL=https://<projeto>.supabase.co
SUPABASE_KEY=<chave secreta do projeto>
```

- `SUPABASE_URL`: endereço do projeto no Supabase.
- `SUPABASE_KEY`: a chave **secreta** (`sb_secret_...`). Ela tem acesso total ao banco, por isso fica só no backend e nunca vai para o aplicativo nem para o GitHub (o `.gitignore` já ignora o `.env`).
- O `.env` também tem uma variável `PORT`, mas o código não a usa: a porta é a do comando `uvicorn`.

### Documentação automática

Com a API rodando, abra **http://localhost:8000/docs**. O FastAPI gera essa página sozinho, a partir do código: ela lista todas as rotas, mostra os campos de cada uma e tem o botão **Try it out** para testar sem precisar do aplicativo.

### Dados de teste

Os scripts de `banco_dados/` criam dados para testar. Eles conferem o que já existe antes de inserir, então podem ser rodados mais de uma vez.

```bash
python banco_dados/criar_banco_teste.py
```

```bash
python banco_dados/criar_salas_teste.py
```

- `criar_banco_teste.py`: cria o usuário `teste@etec.com` (senha `teste123`, tipo `ALUNO`), já com a senha em hash.
- `criar_salas_teste.py`: cria as salas de aula 1 a 25 e a Sala Maker.

---

## 2. Estrutura de pastas

```
backend/
├── main.py              # cria o app FastAPI, configura o CORS e junta todas as rotas
├── database.py          # lê o .env e cria a conexão com o Supabase (usada por todas as rotas)
├── requirements.txt     # bibliotecas Python, com as versões fixas
├── .env                 # chaves do Supabase (fora do Git)
├── users/routes.py      # login e usuários
├── avisos/routes.py     # mural de avisos e upload de imagens
├── cardapios/routes.py  # merenda e respostas do "Comerá hoje?"
├── salas/routes.py      # salas e laboratórios
├── reservas/routes.py   # reservas de sala (avulsas e semanais)
├── atendimentos/routes.py  # solicitações de atendimento
├── ocorrencias/routes.py   # ocorrências e manutenção
├── notas/routes.py      # boletim (menções)
├── notas/decisao_boletim.md
├── turmas/routes.py     # turmas
├── disciplinas/routes.py   # disciplinas e quais professores dão cada uma
├── substituicoes/routes.py # ainda vazio (só o router)
└── banco_dados/         # scripts SQL e scripts de dados de teste
```

**Uma pasta por assunto.** Cada pasta tem um `routes.py` com um `APIRouter`, e o `main.py` só junta todos:

```python
from avisos.routes import router as avisos_router
...
app.include_router(avisos_router)
```

Assim, quem mexe nos avisos abre uma pasta só, e duas pessoas conseguem trabalhar em assuntos diferentes sem mexer no mesmo arquivo.

---

## 3. Como uma requisição funciona

Exemplo: o aplicativo publica um aviso.

```
App  ──POST /avisos {titulo, descricao, ...}──▶  FastAPI
                                                  │ 1. Pydantic valida o JSON (AvisoEntrada)
                                                  │    campo faltando ou errado → 422 automático
                                                  │ 2. a função da rota aplica as regras
                                                  │    (ex: data de expiração no passado → 400)
                                                  │ 3. supabase.table("avisos").insert(...).execute()
                                                  ▼
                                             Supabase (PostgreSQL)
                                                  │ 4. o banco confere as próprias regras
                                                  │    (not null, unique, check, chave estrangeira)
                                                  ▼
App  ◀──201 {"mensagem": "...", id, titulo, ...}── FastAPI
```

1. **Validação de entrada (Pydantic).** Cada rota recebe um modelo, por exemplo `AvisoEntrada`. O FastAPI confere tipos, tamanhos e campos obrigatórios **antes** de a função rodar. Se algo estiver errado, ele mesmo responde `422` dizendo qual campo falhou.
2. **Regras da escola.** A função da rota faz o que o Pydantic não sabe fazer sozinho: conferir se quem reserva é professor, se a sala está livre, etc.
3. **Banco.** A conexão criada em `database.py` monta a consulta e o Supabase a executa no PostgreSQL. O [README do banco](banco_dados/README.md#5-o-sql-por-trás-das-rotas) mostra o SQL equivalente a cada uma dessas consultas.
4. **Resposta.** A rota devolve um dicionário Python, que o FastAPI transforma em JSON.

---

## 4. Rotas

Os campos completos de cada rota estão em http://localhost:8000/docs. Aqui está o resumo do que existe e para que serve.

### Usuários e login (`users/routes.py`)

| Método | Rota | O que faz |
|---|---|---|
| POST | `/login` | Confere e-mail e senha. Devolve o usuário (sem a senha). `401` se errar, `403` se o usuário estiver desativado |
| GET | `/usuarios` | Lista usuários. Filtros: `?tipo=ALUNO` e `?turma_id=1` |
| GET | `/usuarios/{id}` | Um usuário |
| POST | `/usuarios` | Cadastra. A senha é salva em hash. `409` se o e-mail já existir |
| PUT | `/usuarios/{id}` | Atualiza só os campos enviados. Se vier senha nova, ela também vira hash |
| DELETE | `/usuarios/{id}` | Apaga |

Os tipos de usuário são `ALUNO`, `PROFESSOR` e `GESTAO`. A senha **nunca** sai da API: toda resposta passa por `usuario_para_dict`, que remove o campo `senha`.

### Avisos (`avisos/routes.py`)

| Método | Rota | O que faz |
|---|---|---|
| GET | `/avisos` | Lista do mais novo para o mais antigo |
| GET | `/avisos/{id}` | Um aviso |
| POST | `/avisos/imagens` | Recebe uma imagem em base64 (JPG, PNG ou WEBP, até 5 MB), salva no Storage do Supabase e devolve o link |
| POST | `/avisos` | Cria o aviso, com até 3 links de imagem e a data de expiração opcional (`expira_em`) |
| PUT | `/avisos/{id}` | Edita. `"expira_em": null` faz o aviso deixar de expirar |
| DELETE | `/avisos/{id}` | Apaga |

### Merenda (`cardapios/routes.py`)

| Método | Rota | O que faz |
|---|---|---|
| GET / POST | `/cardapios` | Lista / cadastra cardápios (um por data) |
| GET / PUT / DELETE | `/cardapios/{id}` | Um cardápio / edita / apaga |
| GET | `/cardapios/{id}/resumo` | Quantos alunos disseram que vão comer e quantos não (tela da gestão) |
| GET | `/cardapios/{id}/respostas/{aluno_id}` | A resposta de um aluno; `vai_comer: null` se ele ainda não respondeu |
| PUT | `/cardapios/{id}/respostas/{aluno_id}` | O aluno responde ou muda a resposta (`{"vai_comer": true}`). Só alunos, e só para cardápios de hoje em diante |

### Salas e reservas (`salas/routes.py`, `reservas/routes.py`)

| Método | Rota | O que faz |
|---|---|---|
| GET / POST | `/salas` | Lista (em ordem de cadastro) / cadastra |
| GET / PUT / DELETE | `/salas/{id}` | Uma sala / edita / apaga |
| GET | `/reservas` | Lista, com o nome da sala e de quem reservou. Filtros: `?data=`, `?sala_id=`, `?usuario_id=` |
| GET | `/reservas/{id}` | Uma reserva |
| POST | `/reservas` | Reserva. Com `repetir_ate`, cria uma reserva por semana até essa data (série) |
| PUT | `/reservas/{id}` | Edita |
| DELETE | `/reservas/{id}` | Cancela uma reserva |
| DELETE | `/reservas/recorrencias/{recorrencia_id}` | Cancela uma série a partir de um dia (`?a_partir_de=`, padrão hoje). As semanas anteriores ficam |

### Boletim (`notas/`, `turmas/`, `disciplinas/`)

| Método | Rota | O que faz |
|---|---|---|
| GET | `/notas` | Lista com `mencao_final` calculada e os nomes de aluno, turma e disciplina. Filtros: `?aluno_id=`, `?professor_id=`, `?turma_id=`, `?bimestre=` |
| GET | `/notas/{id}` | Uma nota |
| POST | `/notas` | Lança menções. Se o aluno ainda não tem nota naquela disciplina e bimestre, cria (`201`); se já tem, completa só as menções vazias (`200`). `409` se tentar sobrescrever uma menção já lançada |
| PUT / DELETE | `/notas/{id}` | Troca menções / apaga |
| GET / POST | `/turmas` | Lista / cadastra |
| GET / PUT / DELETE | `/turmas/{id}` | Uma turma / edita / apaga |
| GET | `/disciplinas` | Lista com os professores de cada uma. `?professor_id=` lista só as que ele dá aula |
| GET / POST | `/disciplinas`, `/disciplinas/{id}` | CRUD de disciplinas. `409` se o nome repetir |
| POST | `/disciplinas/{id}/professores` | Liga um professor à disciplina (`{"professor_id": 14}`) |
| DELETE | `/disciplinas/{id}/professores/{professor_id}` | Desliga |

### Atendimento e ocorrências (`atendimentos/`, `ocorrencias/`)

| Método | Rota | O que faz |
|---|---|---|
| GET | `/atendimentos` | Lista da mais nova para a mais antiga, com o nome, o tipo e a turma de quem pediu. `?usuario_id=` lista só as de uma pessoa |
| GET / POST | `/atendimentos/{id}`, `/atendimentos` | Uma solicitação / cria |
| PUT | `/atendimentos/{id}` | Responde, muda o status ou edita assunto e descrição. O app usa os status `ABERTO`, `EM ANDAMENTO` e `RESOLVIDO`. `"assunto": null` apaga o assunto |
| DELETE | `/atendimentos/{id}` | Apaga |
| GET / POST / PUT / DELETE | `/ocorrencias`, `/ocorrencias/{id}` | CRUD de ocorrências (sem tela no app ainda) |

### Ainda sem rotas

- `substituicoes/routes.py` só cria o router; as rotas de substituição de professores ainda não foram feitas. A tabela `substituicoes` já existe no banco.
- A tabela `eventos` existe no banco, mas a API de eventos foi retirada (commit `7db3e87`).

---

## 5. Padrões usados em todas as rotas

Todas as pastas seguem o mesmo molde. Quem entende uma, entende as outras.

### Dois modelos por recurso: `Entrada` e `Atualizacao`

```python
class SalaEntrada(BaseModel):        # POST: campos obrigatórios
    nome: str = Field(min_length=1, max_length=100)
    tipo: str = Field(min_length=1, max_length=50)
    disponivel: bool = True

class SalaAtualizacao(BaseModel):    # PUT: tudo opcional
    nome: str | None = Field(default=None, min_length=1, max_length=100)
    ...
```

- O **POST** exige os campos obrigatórios.
- O **PUT** aceita só o que mudou. `model_dump(exclude_none=True)` monta o `update` apenas com os campos enviados, então editar o nome de uma sala não apaga o tipo dela.
- Os limites (`max_length=100`) são **iguais aos tamanhos das colunas** no banco, para a API recusar com uma mensagem clara antes de o banco recusar com um erro técnico.

### Códigos de resposta

| Código | Quando |
|---|---|
| `200` | Deu certo (GET, PUT) |
| `201` | Criou algo (POST) |
| `204` | Apagou (DELETE); a resposta vem vazia |
| `400` | Pedido não faz sentido para a regra (ex: horário de fim antes do início, nada para atualizar) |
| `401` | E-mail ou senha errados |
| `403` | Usuário desativado, ou ação de outro tipo de usuário (ex: só aluno responde o "Comerá hoje?") |
| `404` | Não encontrado |
| `409` | Conflito com algo que já existe (e-mail repetido, sala ocupada, menção já lançada) |
| `422` | Dados com formato errado; gerado pelo próprio FastAPI |
| `500` | Erro ao falar com o banco |

O erro sempre vem como `{"detail": "mensagem em português"}`. O aplicativo mostra essa mensagem direto na tela (ver `getApiErrorMessage` no frontend).

### Respostas de criação e edição

```python
return {
    "mensagem": "Sala criada com sucesso",
    **resposta.data[0],
}
```

O `**` "espalha" a linha salva dentro do dicionário. O aplicativo recebe a mensagem **e** o registro completo (com o `id` gerado), sem precisar fazer outro GET.

### Tratando erros do banco

```python
try:
    resposta = supabase.table("salas").insert(...).execute()
except APIError as erro:
    raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar a sala: {erro.message}")
```

Quando o banco recusa algo (uma regra `unique`, uma chave estrangeira), a biblioteca lança `APIError`. A rota transforma isso em uma resposta HTTP. Em alguns casos ela reconhece a regra pelo nome e devolve uma mensagem melhor: `usuarios_email_key` vira "E-mail já cadastrado" (`409`).

### Trazendo dados de outras tabelas

```python
CAMPOS = "*, sala:salas(nome, tipo), usuario:usuarios(nome)"
supabase.table("reservas").select(CAMPOS)
```

Cada reserva já vem com o nome da sala e de quem reservou, numa consulta só, em vez de o app buscar cada sala e cada usuário separadamente. É o `JOIN` do SQL; o [README do banco](banco_dados/README.md#5-o-sql-por-trás-das-rotas) mostra a consulta equivalente.

### Datas

```python
dados.model_dump(mode="json")
```

O Pydantic guarda datas como objetos `date` do Python, que a biblioteca do Supabase não sabe enviar. `mode="json"` converte para texto (`"2026-11-25"`), o formato que o banco aceita.

---

## 6. Regras de negócio

| Regra | Onde |
|---|---|
| Senhas salvas com **bcrypt**, nunca em texto puro | `users/routes.py` (`gerar_hash`, `senha_confere`) |
| Usuário com `ativo = false` não entra | `POST /login` → `403` |
| Só professor e gestão reservam sala | `POST /reservas` |
| Duas reservas da mesma sala não podem se cruzar no horário | `datas_ocupadas` em `reservas/routes.py` → `409` |
| Reserva semanal: no máximo um ano; se **qualquer** semana estiver ocupada, nenhuma é criada | `POST /reservas` com `repetir_ate` |
| Aviso com data de expiração no passado é recusado | `POST` e `PUT /avisos` |
| Imagem de aviso: JPG, PNG ou WEBP, até 5 MB, até 3 por aviso | `POST /avisos/imagens`, `AvisoEntrada` |
| Professor só lança nota das disciplinas que dá aula; a gestão lança de qualquer uma | `POST /notas` (consulta `professor_disciplinas`) |
| Uma menção já lançada não é sobrescrita pelo POST; para trocar, usa-se o PUT | `POST /notas` → `409` |
| Menção final = média de trabalho, atividades e prova (I=1, R=2, B=3, MB=4), arredondada. Fica vazia enquanto faltar alguma | `calcular_mencao_final` |
| Só aluno responde "Comerá hoje?", e só para cardápios de hoje em diante | `PUT /cardapios/{id}/respostas/{aluno_id}` |

---

## 7. Decisões do projeto (e por quê)

### Por que FastAPI (e não Express, que era a primeira versão)?

O backend começou em **Node.js com Express** e foi reescrito em **Python com FastAPI** (commit `f50070d`). O que pesou:

- **Validação sem código repetido.** Com o Pydantic, um modelo como `SalaEntrada` já valida tipo, tamanho e campos obrigatórios e devolve `422` com a explicação. No Express, cada rota precisaria de `if`s manuais ou de uma biblioteca extra (Joi, Zod) para fazer o mesmo.
- **Documentação de graça.** A página `/docs` sai do próprio código. Ninguém precisa manter um documento de rotas à parte, e a banca e a equipe testam a API pelo navegador.
- **Menos código por rota.** Os parâmetros da função viram filtros da URL (`def listar_reservas(data: date | None = None)` vira `?data=`) e o retorno vira JSON sozinho. As rotas ficam curtas e parecidas umas com as outras.
- **Tipos no próprio código.** As anotações (`sala_id: int`, `data: date | None`) servem ao mesmo tempo de documentação, de validação e de conversão: o `"2026-11-25"` que chega na URL já vira uma data do Python.
- **Desempenho suficiente.** O FastAPI está entre os frameworks Python mais rápidos, e a carga de uma escola é pequena.

### Por que Supabase (e não um PostgreSQL instalado na máquina)?

- **Banco na nuvem, igual para todos.** A equipe inteira usa o mesmo banco, sem cada um instalar e configurar um PostgreSQL. Os dados de teste que um cria, os outros veem.
- **Continua sendo PostgreSQL.** Tudo o que se aprende de SQL vale do mesmo jeito; os scripts de `banco_dados/` são SQL puro, rodados no SQL Editor do Supabase.
- **Storage incluso.** As imagens dos avisos ficam no Storage do Supabase, sem precisar de outro serviço.
- **Painel visual.** Dá para conferir e corrigir dados direto pelo navegador.

### Por que a biblioteca `supabase` (e não SQL escrito à mão ou um ORM)?

- Comparado a **SQL em texto**, os métodos (`.eq()`, `.insert()`) evitam montar consultas juntando strings, que é a origem de *SQL injection*.
- Comparado a um **ORM** (SQLAlchemy), não é preciso descrever as tabelas de novo em Python nem manter *migrations* duplicadas; as tabelas são criadas uma vez, pelos scripts SQL.
- Os relacionamentos (`sala:salas(nome)`) vêm prontos, porque o Supabase lê as chaves estrangeiras do banco.

### Por que a chave secreta fica só no backend?

O aplicativo **nunca** fala direto com o Supabase; tudo passa pela API. Assim a chave secreta não vai para dentro do app, onde qualquer um poderia extraí-la, e as regras da escola ficam num lugar só. Por isso também o upload de imagens passa pela rota `POST /avisos/imagens`, em vez de o app enviar direto para o Storage.

### Por que bcrypt nas senhas?

O bcrypt é feito para ser **lento** de propósito e coloca um valor aleatório (*salt*) em cada hash. Mesmo que alguém copie a tabela `usuarios`, não consegue descobrir as senhas nem perceber que duas pessoas usam a mesma senha. Um hash rápido, como MD5 ou SHA, pode ser quebrado por força bruta.

### Por que validar na API **e** no banco?

As mesmas regras (tamanho, valores permitidos, `unique`) existem nos dois lugares de propósito:
- a **API** responde com uma mensagem clara em português, que o app mostra para o usuário;
- o **banco** garante a regra mesmo para dados inseridos por outro caminho, como o painel do Supabase.

### Por que a menção final é calculada, e não salva?

Se a final ficasse numa coluna, toda troca de menção precisaria lembrar de recalculá-la, e uma final desatualizada poderia ficar no banco. Calculando na hora de devolver (`nota_com_final`), ela está sempre certa. Detalhes em [`notas/decisao_boletim.md`](notas/decisao_boletim.md).

### Por que a reserva semanal vira várias linhas?

Cada semana da série é uma reserva normal, ligada às outras pelo mesmo `recorrencia_id`. Assim a conferência de horário ocupado, a listagem por dia e o cancelamento de uma reserva funcionam igual para avulsas e semanais, sem regra especial. Para cancelar a série inteira (ou dali para frente), basta apagar pelo `recorrencia_id`.

### Por que o CORS lista endereços?

O navegador bloqueia uma página de um endereço (o Expo Web em `localhost:8081`) de chamar outro (a API em `localhost:8000`), a não ser que a API autorize. O `CORSMiddleware` em `main.py` autoriza só os endereços de desenvolvimento. No celular (Expo Go) isso não se aplica, porque não é um navegador.

---

## 8. Limitações conhecidas

- **Sem autenticação nas rotas.** O `/login` confere a senha, mas não devolve um token, e as outras rotas confiam no `usuario_id` enviado pelo app. Quem chamar a API direto consegue ler e alterar dados de qualquer pessoa. Foi uma escolha consciente para o escopo do TCC. O próximo passo seria o `/login` devolver um **JWT** e cada rota descobrir o usuário a partir dele.
- **PUT e DELETE não conferem permissões.** O app só mostra "Editar" e "Excluir" para quem pode, mas a API aceita de qualquer um (mesmo motivo acima).
- **Reserva semanal depende de um script pendente.** `banco_dados/reservas_recorrentes.sql` ainda não foi rodado no banco: a coluna `recorrencia_id` não existe, e criar uma reserva semanal falha. As avulsas funcionam. Ver o [README do banco](banco_dados/README.md#3-scripts-de-alteração-migrations).
- **Imagens órfãs.** Ao apagar um aviso, as imagens dele continuam no Storage.
- **Substituições e eventos** ainda não têm rotas.
- **Sem testes automatizados.** As rotas são testadas pelo `/docs` e pelo aplicativo.
