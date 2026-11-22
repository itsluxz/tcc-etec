# Boletim — decisões e conceitos novos

Este documento explica como a API do boletim (`backend/notas/routes.py`) foi pensada e quais trechos de código trazem algo que ainda não existia no projeto.

---

## 1. Decisões

### Uma tabela `notas`, uma linha por aluno, disciplina e bimestre

Cada linha guarda **as menções de um aluno, em uma disciplina, em um bimestre**: trabalho, atividades e prova. O boletim de um aluno é a lista das linhas dele.

```sql
create table notas (
  id serial primary key,
  aluno_id int4 not null references usuarios(id),
  professor_id int4 references usuarios(id),
  turma_id int4 not null references turmas(id),
  disciplina_id int4 not null references disciplinas(id),
  bimestre int2 not null check (bimestre between 1 and 4),
  mencao_trabalho varchar(2) not null check (mencao_trabalho in ('I', 'R', 'B', 'MB')),
  mencao_atividades varchar(2) not null check (mencao_atividades in ('I', 'R', 'B', 'MB')),
  mencao_prova varchar(2) not null check (mencao_prova in ('I', 'R', 'B', 'MB')),
  observacao text,
  criado_em timestamp default now(),
  unique (aluno_id, disciplina_id, bimestre)
);
```

(É como a tabela fica depois de rodar `turmas.sql`, `disciplinas.sql` e `notas_mencoes.sql`, em `backend/banco_dados/`.)

**Por que não uma tabela `boletins` com uma coluna por disciplina?** Porque toda disciplina nova exigiria uma coluna nova no banco. Com uma linha por menção, uma disciplina nova é só mais uma linha.

### Tabela `turmas`

```sql
create table turmas (
  id serial primary key,
  nome varchar(50) not null,
  ano int4 not null,
  unique (nome, ano)
);
```

Toda tabela que tinha uma coluna de texto `turma` (`usuarios`, `notas` e `substituicoes`) passou a ter `turma_id`, apontando para `turmas`. O script completo está em `backend/banco_dados/turmas.sql`.

- **Por que uma tabela em vez de texto?** Com texto, "3A", "3 A" e "3a" viram três turmas diferentes. Com a tabela, a turma é cadastrada uma vez e todo mundo usa o mesmo `id`.
- **`usuarios.turma_id`:** é a turma **atual** do aluno. Fica vazia para professores e gestores. É com ela que o app descobre os alunos de uma turma: `GET /usuarios?tipo=ALUNO&turma_id=1` devolve os alunos com os `id`s usados no `POST /notas`.
- **`notas.turma_id`:** é a turma em que o aluno estava **quando recebeu a nota**. No ano seguinte, o aluno muda de turma em `usuarios`, mas o boletim antigo continua mostrando a turma antiga.
- **`unique (nome, ano)`:** permite ter uma "3A" em 2026 e outra em 2027, mas não duas "3A" no mesmo ano.
- A API de turmas (`backend/turmas/routes.py`) segue o mesmo padrão das outras: `GET`, `POST`, `PUT` e `DELETE` em `/turmas`.

### Tabelas `disciplinas` e `professor_disciplinas`

```sql
create table disciplinas (
  id serial primary key,
  nome varchar(100) not null unique
);

create table professor_disciplinas (
  professor_id int4 not null references usuarios(id) on delete cascade,
  disciplina_id int4 not null references disciplinas(id) on delete cascade,
  primary key (professor_id, disciplina_id)
);
```

- **Por que a tabela do meio?** Um professor dá aula de várias disciplinas, e uma disciplina tem vários professores. Isso não cabe em uma coluna só, então cada par professor–disciplina vira uma linha de `professor_disciplinas`.
- **`primary key (professor_id, disciplina_id)`:** impede ligar o mesmo professor à mesma disciplina duas vezes.
- **`on delete cascade`:** ao apagar uma disciplina ou um professor, as ligações dele são apagadas junto.
- **`notas.disciplina_id`:** a nota aponta para a disciplina pelo `id`, igual à turma. O script `disciplinas.sql` converte as notas que já existiam: cadastra cada nome que aparecia em `notas.disciplina` como disciplina e liga a nota a ela.
- **Professor só lança nota da disciplina que dá aula:** o `POST /notas` confere em `professor_disciplinas` se o professor está ligado à disciplina. A gestão pode lançar nota de qualquer disciplina.

A API de disciplinas (`backend/disciplinas/routes.py`) tem o CRUD básico em `/disciplinas` e duas rotas para ligar e desligar professores: `POST /disciplinas/{id}/professores` e `DELETE /disciplinas/{id}/professores/{professor_id}`. `GET /disciplinas?professor_id=...` lista só as disciplinas de um professor.

### Aluno e professor vêm da tabela `usuarios`

Não existe tabela separada de alunos nem de professores. Quem é quem é definido pela coluna `tipo` (`ALUNO`, `PROFESSOR`, `GESTAO`), a mesma lógica usada nas reservas:

- `aluno_id` precisa ser de um usuário `ALUNO`;
- `professor_id` (quem lançou a nota) precisa ser de um `PROFESSOR` ou `GESTAO`.

### Menções I, R, B e MB

| Menção | Significado  | Situação  |
|--------|--------------|-----------|
| I      | Insatisfatório | Reprovado |
| R      | Regular      | Aprovado  |
| B      | Bom          | Aprovado  |
| MB     | Muito Bom    | Aprovado  |

A ordem, da menor para a maior, é `I < R < B < MB`.

- **A API não devolve a situação (aprovado/reprovado).** Essa regra é simples e fica na tela, que mostra a cor de acordo com a menção.

### Três menções e a menção final

Cada nota tem três menções: **trabalho**, **atividades** e **prova**. Cada uma recebe `I`, `R`, `B` ou `MB`. A **menção final** é a média das três:

1. cada menção vira um número, pela ordem: `I = 1`, `R = 2`, `B = 3`, `MB = 4`;
2. soma os três e divide por 3;
3. arredonda para o número inteiro mais próximo;
4. o número volta a ser menção.

| Trabalho | Atividades | Prova | Conta | Final |
|---|---|---|---|---|
| B | B | R | (3 + 3 + 2) / 3 = 2,67 → 3 | B |
| I | R | B | (1 + 2 + 3) / 3 = 2 | R |
| I | MB | MB | (1 + 4 + 4) / 3 = 3 → 3 | B |
| I | I | MB | (1 + 1 + 4) / 3 = 2 | R |

- **A final não fica salva no banco.** Ela é calculada pela API toda vez que uma nota é devolvida (`mencao_final` na resposta). Assim, ao editar uma das três menções, a final muda junto, e nunca fica uma final desatualizada no banco.
- **Não existe empate no arredondamento.** A média de três números inteiros sempre termina em `,00`, `,33` ou `,67`, nunca em `,5`. Por isso o `round` do Python, que arredonda `,5` de um jeito diferente do esperado, não causa problema aqui.
- As notas lançadas antes dessa mudança receberam a menção antiga nas três (`notas_mencoes.sql`), então a final delas continua igual.

### Bimestre de 1 a 4

O período usado é o bimestre, como no ensino médio da ETEC. Se for usado em curso técnico modular, troque `bimestre` por `semestre` e o limite para `1` a `2`.

### Rota `/notas`

A tela `BoletimScreen.js` já tentava buscar dados em `/notas`. Além disso, o nome bate com o da tabela, como nas outras pastas (`avisos`, `reservas`...).

### Sem autenticação por enquanto

A API confia no `aluno_id` e no `professor_id` enviados pelo app. Ainda não existe JWT, então qualquer um que chame a API direto consegue lançar ou ver notas. Isso foi uma escolha consciente para o TCC. O próximo passo seria o `/login` devolver um token e o backend descobrir quem é o usuário a partir dele.

### O que ficou de fora

- **O `PUT /notas` não confere os tipos de novo.** Se alguém trocar o `aluno_id` para um professor, a troca passa. Como em reservas, isso ficou de fora para manter o código simples.
- **O `PUT` e o `DELETE` não conferem quem está pedindo.** A tela só mostra editar e excluir para o professor, nas notas que ele lançou, mas a API aceita de qualquer um (falta o JWT).

---

## 2. Conceitos novos no código

O resto do arquivo segue exatamente o padrão de `ocorrencias` e `reservas`. Abaixo estão só os trechos que trazem algo novo para o projeto.

### `Literal`: aceitar só alguns valores

```python
from typing import Literal

Mencao = Literal["I", "R", "B", "MB"]

class NotaEntrada(BaseModel):
    mencao_trabalho: Mencao
    mencao_atividades: Mencao
    mencao_prova: Mencao
```

`Literal` diz ao Pydantic que o campo só pode ter um daqueles valores exatos. Se o app enviar `"mencao_prova": "A"`, o FastAPI responde **422** sozinho, sem nenhum `if` no código. Também aparece no `/docs` como uma lista de opções.

O mesmo conceito foi usado em `users/routes.py`, para o `tipo` do usuário:

```python
TipoUsuario = Literal["ALUNO", "PROFESSOR", "GESTAO"]
```

### `Field(ge=..., le=...)`: limitar números

```python
bimestre: int = Field(ge=1, le=4)
```

`min_length` e `max_length`, que já eram usados no projeto, limitam o **tamanho de textos**. Para **números**, usa-se `ge` (*greater or equal*, maior ou igual) e `le` (*less or equal*, menor ou igual). Bimestre `5` é recusado com 422.

### Filtros opcionais na URL (*query parameters*)

```python
@router.get("/notas", status_code=200)
def listar_notas(aluno_id: int | None = None, professor_id: int | None = None, turma_id: int | None = None, bimestre: int | None = None):
    consulta = supabase.table("notas").select(CAMPOS)
    if aluno_id:
        consulta = consulta.eq("aluno_id", aluno_id)
    if professor_id:
        consulta = consulta.eq("professor_id", professor_id)
    if turma_id:
        consulta = consulta.eq("turma_id", turma_id)
    ...
    resposta = consulta.execute()
```

Os parâmetros da função que **não estão no caminho** da rota (como `{nota_id}` está) viram parâmetros depois do `?` na URL:

- `GET /notas`: todas as notas
- `GET /notas?aluno_id=3`: o boletim do aluno 3
- `GET /notas?turma_id=1&bimestre=1`: a turma 1 no 1º bimestre

A consulta é montada aos poucos: cada `if` só adiciona o filtro se ele foi enviado, e o `.execute()` vem no final. O mesmo foi feito em `GET /usuarios?tipo=PROFESSOR`.

Não existe filtro por disciplina: o boletim é mostrado inteiro, com todas as disciplinas juntas. A coluna `disciplina_id` continua na tabela, porque cada menção ainda é de uma disciplina.

Uso esperado no app:
- **Aluno:** `GET /notas?aluno_id={usuario.id}`, o boletim inteiro dele (o `usuario` vem do login).
- **Professor:** `GET /notas?professor_id={usuario.id}`, as notas que ele lançou.
- **Gestão:** `GET /notas`, todas (ou filtradas por `turma_id` e `bimestre`).

### Trazer dados de outra tabela na mesma consulta

```python
CAMPOS = "*, aluno:usuarios!aluno_id(nome), turma:turmas(nome, ano), disciplina:disciplinas(nome)"
```

Sem isso, a nota viria só com `aluno_id: 3`, e o app teria que chamar `/usuarios/3` para cada linha para descobrir o nome. Com isso, cada nota já vem assim:

```json
{
  "id": 1,
  "aluno_id": 3,
  "turma_id": 1,
  "disciplina_id": 2,
  "bimestre": 1,
  "mencao_trabalho": "B",
  "mencao_atividades": "B",
  "mencao_prova": "R",
  "mencao_final": "B",
  "aluno": { "nome": "Maria" },
  "turma": { "nome": "3A", "ano": 2026 },
  "disciplina": { "nome": "Matemática" }
}
```

Lendo o texto por partes:
- `*`: todas as colunas de `notas`;
- `aluno:`: o nome da chave no JSON de resposta;
- `usuarios`: a tabela de onde vem o dado;
- `!aluno_id`: qual coluna usar para ligar as tabelas. É necessário porque `notas` aponta para `usuarios` **duas vezes** (`aluno_id` e `professor_id`), e o Supabase precisa saber qual das duas usar;
- `(nome)`: só a coluna `nome`, sem trazer a senha e o resto.

A turma e a disciplina usam a mesma ideia: `turma:turmas(nome, ano)` e `disciplina:disciplinas(nome)`. Elas não precisam do `!`, porque `notas` aponta para `turmas` e para `disciplinas` uma vez só.

Em `disciplinas/routes.py`, `professores:usuarios(id, nome)` faz o mesmo passando pela tabela do meio: o Supabase percebe sozinho que `disciplinas` e `usuarios` se ligam por `professor_disciplinas` e devolve a lista de professores de cada disciplina.

### `.in_()`: "é um destes valores"

```python
supabase.table("usuarios").select("id").eq("id", usuario_id).in_("tipo", ["PROFESSOR", "GESTAO"])
```

`.eq()` compara com **um** valor, e `.in_()` aceita **qualquer um da lista**. É o `IN` do SQL (`where tipo in ('PROFESSOR', 'GESTAO')`). O nome tem `_` no final porque `in` é palavra reservada do Python.

### Função auxiliar para não repetir código

```python
def usuario_tem_tipo(usuario_id, tipos):
    ...
    return bool(resposta.data)
```

O `POST /notas` precisa conferir **dois** usuários (o aluno e o professor). Em vez de escrever a mesma consulta duas vezes, ela virou uma função, no mesmo estilo de `gerar_hash` e `usuario_para_dict` em `users/routes.py`.

`bool(resposta.data)` devolve `True` se a consulta encontrou alguma linha e `False` se a lista veio vazia.

### Calculando a menção final

```python
MENCOES = ["I", "R", "B", "MB"]

def calcular_mencao_final(nota):
    valores = [
        MENCOES.index(nota["mencao_trabalho"]) + 1,
        MENCOES.index(nota["mencao_atividades"]) + 1,
        MENCOES.index(nota["mencao_prova"]) + 1,
    ]
    media = sum(valores) / 3
    return MENCOES[round(media) - 1]


def nota_com_final(linha):
    return {**linha, "mencao_final": calcular_mencao_final(linha)}
```

- `MENCOES.index("B")` devolve a posição de `"B"` na lista, que é `2` (a contagem começa em 0). Com o `+ 1`, `I` vira 1 e `MB` vira 4.
- `MENCOES[round(media) - 1]` faz o caminho de volta: a média arredondada `3` vira a posição `2`, que é `"B"`.
- `{**linha, "mencao_final": ...}` cria um dicionário novo com tudo que já estava na nota **mais** a chave `mencao_final`. É o mesmo `**` usado no `return` das rotas (`{"mensagem": ..., **resposta.data[0]}`).

`nota_com_final` é chamada em todas as rotas que devolvem nota (`GET`, `POST` e `PUT`), por isso a final sempre vem na resposta.

### Regras no próprio banco: `check` e `unique`

```sql
bimestre int2 not null check (bimestre between 1 and 4),
mencao_prova varchar(2) not null check (mencao_prova in ('I', 'R', 'B', 'MB')),
unique (aluno_id, disciplina_id, bimestre)
```

- **`check`**: o banco recusa valores fora da regra, mesmo que alguém insira pelo painel do Supabase sem passar pela API.
- **`unique (aluno_id, disciplina_id, bimestre)`**: impede duas menções para o mesmo aluno, na mesma disciplina, no mesmo bimestre. Se o app tentar lançar de novo, o `POST` cai no `except APIError` e responde **409** "Esse aluno já tem nota nessa disciplina e bimestre". Para corrigir uma menção, usa-se o `PUT`.

A API e o banco validam as mesmas regras de propósito: a API dá uma mensagem de erro clara para o app, e o banco garante que nenhum dado errado entre por outro caminho.
