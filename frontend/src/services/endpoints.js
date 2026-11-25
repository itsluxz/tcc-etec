import api from './api';

export const authenticationApi = {
  login: (credentials) => api.post('/login', credentials),
};

export const turmasApi = {
  list: () => api.get('/turmas'),
};

export const disciplinasApi = {
  // filtro opcional: { professor_id } lista só as disciplinas desse professor
  list: (filtros) => api.get('/disciplinas', { params: filtros }),
};

export const usuariosApi = {
  // filtros opcionais: { tipo, turma_id }
  list: (filtros) => api.get('/usuarios', { params: filtros }),
};

export const salasApi = {
  list: () => api.get('/salas'),
};

export const reservasApi = {
  // filtros opcionais: { data, sala_id, usuario_id }
  list: (filtros) => api.get('/reservas', { params: filtros }),
  // com repetir_ate, cria uma reserva por semana até essa data
  create: (reserva) => api.post('/reservas', reserva),
  remove: (reservaId) => api.delete(`/reservas/${reservaId}`),
  // cancela uma série semanal a partir de um dia (inclusive)
  removeSerie: (recorrenciaId, aPartirDe) =>
    api.delete(`/reservas/recorrencias/${recorrenciaId}`, { params: { a_partir_de: aPartirDe } }),
};

export const notasApi = {
  // filtros opcionais: { aluno_id, turma_id, bimestre }
  list: (filtros) => api.get('/notas', { params: filtros }),
  get: (notaId) => api.get(`/notas/${notaId}`),
  create: (nota) => api.post('/notas', nota),
  update: (notaId, nota) => api.put(`/notas/${notaId}`, nota),
  remove: (notaId) => api.delete(`/notas/${notaId}`),
};

export const avisosApi = {
  list: () => api.get('/avisos'),
  get: (avisoId) => api.get(`/avisos/${avisoId}`),
  create: (aviso) => api.post('/avisos', aviso),
  update: (avisoId, aviso) => api.put(`/avisos/${avisoId}`, aviso),
  remove: (avisoId) => api.delete(`/avisos/${avisoId}`),
  // envia uma imagem ({ base64, tipo }) e recebe { url }; tempo maior porque a imagem é grande
  uploadImagem: (imagem) => api.post('/avisos/imagens', imagem, { timeout: 60000 }),
};

export const atendimentosApi = {
  // filtro opcional: { usuario_id }; sem filtro, lista todos (com o nome e a turma de quem pediu)
  list: (filtros) => api.get('/atendimentos', { params: filtros }),
  create: (atendimento) => api.post('/atendimentos', atendimento),
  // { status }, { resposta } ou { assunto, descricao }
  update: (atendimentoId, atendimento) => api.put(`/atendimentos/${atendimentoId}`, atendimento),
  remove: (atendimentoId) => api.delete(`/atendimentos/${atendimentoId}`),
};

export const cardapiosApi = {
  list: () => api.get('/cardapios'),
  get: (cardapioId) => api.get(`/cardapios/${cardapioId}`),
  create: (cardapio) => api.post('/cardapios', cardapio),
  update: (cardapioId, cardapio) => api.put(`/cardapios/${cardapioId}`, cardapio),
  remove: (cardapioId) => api.delete(`/cardapios/${cardapioId}`),
  // "Comerá hoje?": resposta do aluno e contagem para a gestão
  getResposta: (cardapioId, alunoId) => api.get(`/cardapios/${cardapioId}/respostas/${alunoId}`),
  responder: (cardapioId, alunoId, vaiComer) =>
    api.put(`/cardapios/${cardapioId}/respostas/${alunoId}`, { vai_comer: vaiComer }),
  resumo: (cardapioId) => api.get(`/cardapios/${cardapioId}/resumo`),
};
