# Cantina — integração da tela com a API

Este documento explica as mudanças feitas para a gestão cadastrar, editar e excluir cardápios pela própria tela de Cantina (aba **Merenda**). Segue o mesmo modelo das integrações do boletim (`src/screens/boletim/integracao_boletim.md`) e das reservas (`src/screens/reservas/integracao_reservas.md`).

A tela já listava os cardápios com `GET /cardapios`. Agora ela também usa o `POST`, o `PUT` e o `DELETE`.

---

## Arquivos alterados

| Arquivo | O que mudou |
|---|---|
| `src/screens/cantina/CantinaScreen.js` | Botão "Novo cardápio", formulário de cadastro e edição, e excluir com confirmação (só para a gestão) |
| `src/styles/screens/cantina.js` | Estilos do botão, do formulário, das ações Editar / Excluir e do "Comerá hoje?" |
| `src/services/endpoints.js` | `cardapiosApi` ganhou `getResposta`, `responder` e `resumo` |
| `backend/cardapios/routes.py` | Rotas das respostas "Comerá hoje?" |
| `backend/banco_dados/cardapio_respostas.sql` | Tabela nova `cardapio_respostas` |

Para o cadastro, edição e exclusão, o backend e o `cardapiosApi` não mudaram: as rotas já existiam. As mudanças no backend são só do "Comerá hoje?" (seção 6).

---

## 1. Rotas usadas (`/cardapios`)

O `cardapiosApi` já tinha uma função para cada rota do backend:

```js
export const cardapiosApi = {
  list: () => api.get('/cardapios'),
  get: (cardapioId) => api.get(`/cardapios/${cardapioId}`),
  create: (cardapio) => api.post('/cardapios', cardapio),
  update: (cardapioId, cardapio) => api.put(`/cardapios/${cardapioId}`, cardapio),
  remove: (cardapioId) => api.delete(`/cardapios/${cardapioId}`),
};
```

| Função | Rota | Quando a tela chama |
|---|---|---|
| `cardapiosApi.list()` | `GET /cardapios` | Ao abrir a tela e depois de salvar ou excluir |
| `cardapiosApi.create(cardapio)` | `POST /cardapios` | Ao cadastrar um cardápio novo |
| `cardapiosApi.update(id, cardapio)` | `PUT /cardapios/{id}` | Ao salvar a edição |
| `cardapiosApi.remove(id)` | `DELETE /cardapios/{id}` | Ao confirmar a exclusão |

O corpo enviado no `POST` e no `PUT` é o mesmo:

```json
{ "data": "2026-11-18", "titulo": "Almoço", "descricao": "Arroz, feijão e frango grelhado" }
```

`titulo` é opcional (até 50 caracteres). `data` e `descricao` são obrigatórios.

---

## 2. Quem pode gerenciar

```js
const user = route.params?.user;
// só a gestão cadastra, edita e exclui cardápios
const podeGerenciar = user?.tipo === 'GESTAO';
```

O `user` é o mesmo que o login passa para todas as abas (`MainTabs.js`). Aluno continua vendo só a lista. Professor não tem a aba Merenda.

---

## 3. Carregar os cardápios

O `loadMenus` saiu de dentro do `useFocusEffect` para poder ser chamado de novo depois de salvar ou excluir (igual ao `loadNotas` do boletim e ao `loadDados` das reservas):

```js
async function loadMenus(preferredDate, isActive = () => true) {
  const { data } = await cardapiosApi.list();
  ...
}

useFocusEffect(
  useCallback(() => {
    let active = true;
    loadMenus(undefined, () => active);
    return () => {
      active = false;
    };
  }, []),
);
```

- `preferredDate`: depois de salvar, a tela já deixa selecionada a data do cardápio salvo.
- `isActive`: se o usuário sair da tela antes da resposta chegar, a tela não é atualizada.

---

## 4. Cadastrar e editar

O botão **Novo cardápio** abre o formulário com a data de hoje. O **Editar**, no cartão do cardápio selecionado, abre o mesmo formulário já preenchido. A diferença fica no `editingId`:

```js
if (editingId) {
  await cardapiosApi.update(editingId, cardapio);
} else {
  await cardapiosApi.create(cardapio);
}
closeForm();
loadMenus(data);
```

**Dia.** Em vez de digitar a data, a gestão toca em um dos 7 botões: hoje e os próximos 6 dias (mesma ideia do `proximosDias()` das reservas). Cada botão mostra o dia da semana e o número (`QUA 19`), e embaixo aparece a data por extenso. O valor guardado já está no formato do banco (`2026-11-19`), então vai direto para a API.

```js
function proximosDias() {
  return Array.from({ length: 7 }, (_, index) => {
    const dia = new Date();
    dia.setDate(dia.getDate() + index);
    return dateKey(dia);
  });
}
```

- Dias que já têm cardápio ficam cinza.
- Na edição, se o cardápio for de uma data fora desses 7 dias, ela aparece como um botão a mais, já selecionado.

Antes de chamar a API, a tela confere:

1. Se um dia foi escolhido ("Escolha o dia do cardápio.").
2. Se a descrição foi preenchida ("Preencha a descrição do cardápio.").
3. Se já existe outro cardápio na mesma data ("Já existe um cardápio nessa data."). A tela mostra um cardápio por data, então não deixa repetir.

Se a API recusar, o `getApiErrorMessage` mostra o `detail` do backend, como nas outras telas.

---

## 5. Excluir

O **Excluir** pede confirmação na própria tela ("Excluir este cardápio? Não / Sim"), igual ao cancelar reserva. Depois do `DELETE`, a lista é recarregada e a tela seleciona hoje ou a primeira data disponível.

---

## 6. "Comerá hoje?"

O aluno responde se vai comer no cardápio do dia, e a gestão vê quantos disseram sim.

### Banco: tabela nova

Script em `backend/banco_dados/cardapio_respostas.sql` (rodar no SQL Editor do Supabase):

```sql
create table cardapio_respostas (
  cardapio_id int4 not null references cardapios(id) on delete cascade,
  aluno_id int4 not null references usuarios(id) on delete cascade,
  vai_comer boolean not null,
  respondido_em timestamp default now(),
  primary key (cardapio_id, aluno_id)
);
```

- **`primary key (cardapio_id, aluno_id)`:** cada aluno tem no máximo uma resposta por cardápio. Se ele muda de ideia, a resposta é trocada, e não duplicada.
- **`on delete cascade`:** ao excluir um cardápio, as respostas dele somem junto.

### Rotas novas (`backend/cardapios/routes.py`)

| Rota | O que faz |
|---|---|
| `GET /cardapios/{id}/resumo` | `{"sim": 12, "nao": 3, "total": 15}` para a gestão |
| `GET /cardapios/{id}/respostas/{aluno_id}` | A resposta do aluno; `vai_comer` vem `null` se ele ainda não respondeu |
| `PUT /cardapios/{id}/respostas/{aluno_id}` | Responde ou muda a resposta: `{"vai_comer": true}` |

O `PUT` usa `upsert` (cria ou atualiza pela chave `cardapio_id, aluno_id`), recusa cardápio de dia que já passou (400) e só aceita usuários do tipo `ALUNO` (403).

No `endpoints.js`, o `cardapiosApi` ganhou:

```js
getResposta: (cardapioId, alunoId) => api.get(`/cardapios/${cardapioId}/respostas/${alunoId}`),
responder: (cardapioId, alunoId, vaiComer) =>
  api.put(`/cardapios/${cardapioId}/respostas/${alunoId}`, { vai_comer: vaiComer }),
resumo: (cardapioId) => api.get(`/cardapios/${cardapioId}/resumo`),
```

### Na tela

- **Aluno:** quando o cardápio selecionado é o de hoje, aparece "Comerá hoje?" com os botões **Sim** e **Não**. O botão escolhido fica azul, e ele pode trocar a resposta durante o dia. Em outros dias a pergunta não aparece.
- **Gestão:** em qualquer cardápio selecionado aparece "Vão comer hoje" (ou "Vão comer neste dia") com o número de alunos que disseram sim, quantos disseram não e o total de respostas.

A busca acontece num `useEffect` que roda sempre que o cardápio selecionado muda e quando a lista é recarregada (ao voltar para a tela), então a contagem da gestão se atualiza sozinha.

---

## Limitações conhecidas

- **Só as 5 primeiras datas aparecem nos botões de dia.** Se a gestão cadastrar um cardápio depois delas, ele aparece selecionado no cartão logo após salvar, mas não ganha botão próprio.
- **Apagar o título na edição.** O `PUT` ignora campos vazios (`exclude_none`), então deixar o título em branco ao editar mantém o título antigo.
- **Segurança.** Como no resto do app, a API não tem JWT: os botões só aparecem para a gestão, mas a API aceita as chamadas de qualquer um.
- **Respostas sem conferência de dono.** Pelo mesmo motivo, a API aceita a resposta de um aluno enviada por outra pessoa, desde que o `aluno_id` seja de um aluno.
