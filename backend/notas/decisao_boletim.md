# Boletim — decisões e conceitos novos

Este documento explica como a API do boletim (`backend/notas/routes.py`) foi pensada e quais trechos de código trazem algo que ainda não existia no projeto.

---

## 1. Decisões

### Uma tabela `notas`, uma linha por menção

Cada linha guarda **a menção de um aluno, em uma disciplina, em um bimestre**. O boletim de um aluno é a lista das linhas dele.

```sql
create table notas (
  id serial primary key,
  aluno_id int4 not null references usuarios(id),
  professor_id int4 references usuarios(id),
  turma varchar(50) not null,
  disciplina varchar(100) not null,
  bimestre int2 not null check (bimestre between 1 and 4),
  mencao varchar(2) not null check (mencao in ('I', 'R', 'B', 'MB')),
  observacao text,
  criado_em timestamp default now(),
  unique (aluno_id, disciplina, bimestre)
);
```

**Por que não uma tabela `boletins` com uma coluna por disciplina?** Porque toda disciplina nova exigiria uma coluna nova no banco. Com uma linha por menção, uma disciplina nova é só mais uma linha.

### `turma` e `disciplina` como texto

O banco não tem tabelas de turmas nem de disciplinas. A tabela `substituicoes` já guarda `turma` e `disciplina` como texto, então o boletim segue o mesmo padrão. Se no futuro existirem as tabelas `turmas` e `disciplinas`, basta trocar essas colunas por `turma_id` e `disciplina_id`.

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

- **A API não calcula média.** Menção não é número, então "média de B e MB" não existe. A menção final é decidida pelo professor ou pelo conselho e lançada como mais uma nota.
- **A API não devolve a situação (aprovado/reprovado).** Essa regra é simples e fica na tela, que mostra a cor de acordo com a menção.

### Bimestre de 1 a 4

O período usado é o bimestre, como no ensino médio da ETEC. Se for usado em curso técnico modular, troque `bimestre` por `semestre` e o limite para `1` a `2`.

### Rota `/notas`

A tela `BoletimScreen.js` já tentava buscar dados em `/notas`. Além disso, o nome bate com o da tabela, como nas outras pastas (`avisos`, `reservas`...).

### Sem autenticação por enquanto

A API confia no `aluno_id` e no `professor_id` enviados pelo app. Ainda não existe JWT, então qualquer um que chame a API direto consegue lançar ou ver notas. Isso foi uma escolha consciente para o TCC. O próximo passo seria o `/login` devolver um token e o backend descobrir quem é o usuário a partir dele.

### O que ficou de fora

- **O `PUT /notas` não confere os tipos de novo.** Se alguém trocar o `aluno_id` para um professor, a troca passa. Como em reservas, isso ficou de fora para manter o código simples.
- **A tela do boletim ainda não foi adaptada.** Ela espera notas numéricas (média e "aprovado se ≥ 6") e precisa ser ajustada para mostrar as menções.

---

## 2. Conceitos novos no código

O resto do arquivo segue exatamente o padrão de `ocorrencias` e `reservas`. Abaixo estão só os trechos que trazem algo novo para o projeto.

### `Literal`: aceitar só alguns valores

```python
from typing import Literal

Mencao = Literal["I", "R", "B", "MB"]

class NotaEntrada(BaseModel):
    mencao: Mencao
```

`Literal` diz ao Pydantic que o campo só pode ter um daqueles valores exatos. Se o app enviar `"mencao": "A"`, o FastAPI responde **422** sozinho, sem nenhum `if` no código. Também aparece no `/docs` como uma lista de opções.

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
def listar_notas(aluno_id: int | None = None, turma: str | None = None, ...):
    consulta = supabase.table("notas").select(CAMPOS)
    if aluno_id:
        consulta = consulta.eq("aluno_id", aluno_id)
    if turma:
        consulta = consulta.eq("turma", turma)
    ...
    resposta = consulta.execute()
```

Os parâmetros da função que **não estão no caminho** da rota (como `{nota_id}` está) viram parâmetros depois do `?` na URL:

- `GET /notas`: todas as notas
- `GET /notas?aluno_id=3`: o boletim do aluno 3
- `GET /notas?turma=3A&bimestre=1`: a turma 3A no 1º bimestre

A consulta é montada aos poucos: cada `if` só adiciona o filtro se ele foi enviado, e o `.execute()` vem no final. O mesmo foi feito em `GET /usuarios?tipo=PROFESSOR`.

Uso esperado no app:
- **Aluno:** `GET /notas?aluno_id={usuario.id}`, só as notas dele (o `usuario` vem do login).
- **Professor/gestão:** `GET /notas?turma=...&disciplina=...`

### Trazer dados de outra tabela na mesma consulta

```python
CAMPOS = "*, aluno:usuarios!aluno_id(nome)"
```

Sem isso, a nota viria só com `aluno_id: 3`, e o app teria que chamar `/usuarios/3` para cada linha para descobrir o nome. Com isso, cada nota já vem assim:

```json
{
  "id": 1,
  "aluno_id": 3,
  "disciplina": "Matemática",
  "bimestre": 1,
  "mencao": "B",
  "aluno": { "nome": "Maria" }
}
```

Lendo o texto por partes:
- `*`: todas as colunas de `notas`;
- `aluno:`: o nome da chave no JSON de resposta;
- `usuarios`: a tabela de onde vem o dado;
- `!aluno_id`: qual coluna usar para ligar as tabelas. É necessário porque `notas` aponta para `usuarios` **duas vezes** (`aluno_id` e `professor_id`), e o Supabase precisa saber qual das duas usar;
- `(nome)`: só a coluna `nome`, sem trazer a senha e o resto.

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

### Regras no próprio banco: `check` e `unique`

```sql
bimestre int2 not null check (bimestre between 1 and 4),
mencao varchar(2) not null check (mencao in ('I', 'R', 'B', 'MB')),
unique (aluno_id, disciplina, bimestre)
```

- **`check`**: o banco recusa valores fora da regra, mesmo que alguém insira pelo painel do Supabase sem passar pela API.
- **`unique (aluno_id, disciplina, bimestre)`**: impede duas menções para o mesmo aluno, na mesma disciplina, no mesmo bimestre. Se o app tentar lançar de novo, o `POST` cai no `except APIError` e responde **400**. Para corrigir uma menção, usa-se o `PUT`.

A API e o banco validam as mesmas regras de propósito: a API dá uma mensagem de erro clara para o app, e o banco garante que nenhum dado errado entre por outro caminho.
