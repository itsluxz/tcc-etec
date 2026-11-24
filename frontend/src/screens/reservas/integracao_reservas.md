# Reservas — integração da tela com a API

Este documento explica as mudanças feitas para a tela de reservas mostrar as salas e as reservas reais, e permitir reservar e cancelar. Segue o mesmo modo da integração do boletim (`src/screens/boletim/integracao_boletim.md`).

---

## Arquivos alterados

| Arquivo | O que mudou |
|---|---|
| `backend/salas/routes.py` | API de salas criada (estava vazia): CRUD em `/salas` |
| `backend/reservas/routes.py` | Filtros na listagem, sala e usuário junto da reserva, e bloqueio de horário ocupado |
| `src/services/endpoints.js` | Novos `salasApi` e `reservasApi` |
| `src/screens/reservas/ReservasScreen.js` | Lista as salas com as reservas do dia, formulário de nova reserva e cancelar reserva |
| `src/styles/screens/reservas.js` | Estilos dos cartões de sala, do formulário e das etiquetas |

---

## 1. Backend

### API de salas (`/salas`)

O arquivo existia, mas estava vazio. Agora segue o mesmo padrão de `turmas` e `avisos`:

| Rota | O que faz |
|---|---|
| `GET /salas` | Lista as salas, em ordem de nome |
| `GET /salas/{id}` | Uma sala |
| `POST /salas` | Cria: `{"nome": "Laboratório 1", "tipo": "Laboratório"}` (`disponivel` é `true` se não for enviado) |
| `PUT /salas/{id}` | Atualiza, ex: `{"disponivel": false}` para tirar a sala de uso |
| `DELETE /salas/{id}` | Apaga (o banco recusa se a sala tiver reservas) |

Os limites (`nome` até 100, `tipo` até 50) são os mesmos das colunas da tabela.

### Mudanças em `/reservas`

**Filtros na listagem**, iguais aos de `/notas`:

- `GET /reservas?data=2026-11-12`: as reservas de um dia
- `GET /reservas?sala_id=1`: as reservas de uma sala
- `GET /reservas?usuario_id=14`: as reservas de uma pessoa

A lista vem em ordem de horário de início (`.order("horario_inicio")`).

**Sala e usuário junto**, como no boletim:

```python
CAMPOS = "*, sala:salas(nome, tipo), usuario:usuarios(nome)"
```

Cada reserva já vem com `"sala": {"nome": ..., "tipo": ...}` e `"usuario": {"nome": ...}`. Assim, a tela mostra quem reservou sem chamar `/usuarios` de novo.

**Horário ocupado.** Antes, dava para reservar a mesma sala duas vezes no mesmo horário. Agora o `POST /reservas` confere antes de salvar e responde **409 "Essa sala já está reservada nesse horário"**:

```python
def sala_ocupada(sala_id, data, inicio, fim):
    resposta = (
        supabase.table("reservas")
        .select("id")
        .eq("sala_id", sala_id)
        .eq("data", data.isoformat())
        .lt("horario_inicio", fim.isoformat())
        .gt("horario_fim", inicio.isoformat())
        .execute()
    )
    return bool(resposta.data)
```

Duas reservas se cruzam quando **uma começa antes da outra terminar** e **termina depois da outra começar**:

- `.lt("horario_inicio", fim)`: a reserva existente começa antes (*less than*) do fim da nova;
- `.gt("horario_fim", inicio)`: a reserva existente termina depois (*greater than*) do início da nova.

| Reserva existente | Nova | Resultado |
|---|---|---|
| 08:00–09:40 | 09:00–10:00 | Recusada (se cruzam) |
| 08:00–09:40 | 09:40–10:30 | Aceita (uma termina quando a outra começa) |
| 08:00–09:40 | 07:00–11:00 | Recusada (a nova cobre a existente) |

`.isoformat()` transforma a data e o horário do Python em texto (`"2026-11-12"`, `"09:40:00"`), que é o formato que o Supabase entende.

**Testado contra o banco:** criei uma sala e reservas de teste, conferi a recusa do horário cruzado, a reserva "encostada" aceita, aluno recusado e o filtro por dia, e depois apaguei tudo.

---

## 2. Tela de reservas

### Quem pode o quê

| Perfil | Ver salas e reservas | Botão "Nova reserva" | Cancelar |
|---|---|---|---|
| Aluno | Sim | Não aparece | Não |
| Professor | Sim | Sim | Só as reservas dele |
| Gestão | Sim | Sim | Só as reservas dele |

O backend também recusa reserva de aluno ("Apenas professores e gestores podem reservar salas").

### Escolhendo o dia sem calendário

O projeto não tem biblioteca de calendário, então a tela mostra **hoje e os próximos 6 dias** como botões ("Hoje", "qui., 12", "sex., 13"...):

```js
function proximosDias() {
  return Array.from({ length: 7 }, (_, index) => {
    const dia = new Date();
    dia.setDate(dia.getDate() + index);
    return {
      key: dateKey(dia),
      label: index === 0 ? 'Hoje' : new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric' }).format(dia),
    };
  });
}
```

- `Array.from({ length: 7 }, ...)` cria uma lista de 7 itens; o `index` vai de 0 a 6.
- `dia.setDate(dia.getDate() + index)` soma `index` dias a hoje. O JavaScript já passa para o próximo mês sozinho.
- `key` é a data no formato do banco (`2026-11-12`), usada nas chamadas da API. `label` é o texto do botão.
- `dateKey` monta a data com o dia **do celular**. `toISOString()` não serve aqui, porque usa o horário de Londres e, à noite, já mostraria o dia seguinte. É a mesma função `localDateKey` que já existia na `HomeScreen`.

### Carregando os dados

```js
async function loadDados() {
  ...
  const salasResposta = await salasApi.list();
  const reservasResposta = await reservasApi.list({ data: selectedDate });
  ...
}

useEffect(() => {
  loadDados();
}, [selectedDate]);
```

**Conceito novo: dependência no `useEffect`.** No boletim, o `useEffect` tinha `[]` e rodava uma vez só. Aqui tem `[selectedDate]`: ele roda quando a tela abre **e de novo toda vez que o dia escolhido muda**. Por isso, tocar em outro dia já busca as reservas daquele dia, sem botão de atualizar.

### Cartão de cada sala

Para cada sala vem um cartão com nome, tipo e uma etiqueta:

- **Livre** (verde): nenhuma reserva no período escolhido;
- **Reservada** (azul): tem reserva no período; os horários aparecem embaixo, com quem reservou e a finalidade;
- **Indisponível** (cinza): sala com `disponivel = false`.

Os botões **Todos / Manhã / Tarde / Noite** filtram as reservas mostradas pelo horário de início: antes das 12:00 é manhã, das 12:00 às 17:59 é tarde, e a partir das 18:00 é noite. O filtro é feito na tela, sem chamar a API de novo.

O banco devolve os horários como `"08:00:00"`. A função `hora` corta para `"08:00"` (`horario.slice(0, 5)`).

### Nova reserva

O botão **Nova reserva** do banner abre o formulário logo abaixo; com ele aberto, o botão vira **Fechar**.

| Campo | Como é preenchido |
|---|---|
| Sala | Botões com as salas **disponíveis** (`disponivel = true`) |
| Dia | Os mesmos 7 dias; começa marcado no dia que está na tela |
| Início / Fim | Texto no formato `08:00` |
| Finalidade | Texto opcional |

`usuario_id` é preenchido sozinho com quem está logado.

Antes de chamar a API, a tela confere se a sala foi escolhida e se os horários estão no formato certo:

```js
function horaValida(texto) {
  return /^\d{2}:\d{2}$/.test(texto);
}
```

**Conceito novo: expressão regular.** `/^\d{2}:\d{2}$/` quer dizer "exatamente 2 dígitos, dois-pontos, 2 dígitos". `08:00` passa; `8:00` e `0800` não. As outras regras (fim depois do início, horário ocupado, só professor e gestão) ficam no backend, e a mensagem dele aparece no formulário pelo `getApiErrorMessage`, como no login.

Depois de salvar, o formulário fecha e a tela vai para o dia da reserva nova. Se já estava nesse dia, só recarrega:

```js
if (formDate === selectedDate) {
  loadDados();
} else {
  setSelectedDate(formDate); // o useEffect busca o dia novo sozinho
}
```

### Cancelar reserva

Nas reservas feitas por quem está logado (`reserva.usuario_id === user.id`) aparece **Cancelar**. Tocar troca para "Cancelar esta reserva? **Não** / **Sim**"; só o **Sim** chama `DELETE /reservas/{id}`. A confirmação fica no próprio cartão (como no boletim), porque os botões do `Alert` não funcionam no navegador.

---

## 3. O que ficou de fora

- **Cadastro de salas pelo app.** As salas são criadas pela API (`POST /salas`, pelo `/docs`). Sem nenhuma sala cadastrada, a tela mostra "Nenhuma sala cadastrada.".
- **Aprovação de reservas.** A tabela tem a coluna `status`, que o banco preenche com `PENDENTE`, mas nada usa esse valor ainda: toda reserva vale assim que é criada.
- **Mais de 7 dias.** Para reservar mais longe, seria preciso um calendário.
- **Segurança.** Como no resto do app, a API confia no `usuario_id` enviado (ainda não existe JWT). Cancelar só aparece para o dono na tela, mas a API aceita de qualquer um.

---

## Reserva recorrente (toda semana)

Para aulas fixas, como "toda sexta, das 07:00 às 10:00, Matemática", o formulário tem **Repetir toda semana**: Não repete, 4 semanas, 8 semanas, 12 semanas ou 6 meses. A repetição usa o dia da semana do dia escolhido, e o formulário mostra o resumo, ex: "Toda sexta-feira, das 07:00 às 10:00, até 18/12/2026 (5 reservas)".

### Banco

Cada semana vira uma linha normal em `reservas`. As linhas da mesma série têm o mesmo `recorrencia_id`. Script em `backend/banco_dados/reservas_recorrentes.sql`:

```sql
alter table reservas add column recorrencia_id uuid;
create index reservas_recorrencia_id_idx on reservas (recorrencia_id);
```

Assim a tela, os filtros (`?data=`) e a checagem de horário ocupado continuam iguais: cada semana é uma reserva comum.

### `POST /reservas` com `repetir_ate`

```json
{ "sala_id": 9, "usuario_id": 14, "data": "2026-11-27", "horario_inicio": "07:00", "horario_fim": "10:00",
  "finalidade": "Matemática", "repetir_ate": "2026-12-18" }
```

- Cria uma reserva por semana, de `data` até `repetir_ate`, todas com o mesmo `recorrencia_id`.
- Se **qualquer** semana já estiver ocupada, não cria nenhuma e responde 409 com as datas do conflito: "Essa sala já está reservada nesse horário em: 04/12, 11/12".
- `repetir_ate` precisa ser depois de `data` e pode ir até um ano depois.
- Sem `repetir_ate`, funciona como antes (uma reserva só).

### Cancelar

- **Só esta:** `DELETE /reservas/{id}`, como antes.
- **Esta e as próximas:** `DELETE /reservas/recorrencias/{recorrencia_id}?a_partir_de=2026-12-04`. As semanas antes dessa data ficam.

Na tela, a reserva recorrente mostra "↻ Toda sexta-feira", e o **Cancelar** pergunta "Só esta" ou "Esta e as próximas".
