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
  create: (reserva) => api.post('/reservas', reserva),
  remove: (reservaId) => api.delete(`/reservas/${reservaId}`),
};

export const notasApi = {
  // filtros opcionais: { aluno_id, turma_id, bimestre }
  list: (filtros) => api.get('/notas', { params: filtros }),
  get: (notaId) => api.get(`/notas/${notaId}`),
  create: (nota) => api.post('/notas', nota),
  update: (notaId, nota) => api.put(`/notas/${notaId}`, nota),
  remove: (notaId) => api.delete(`/notas/${notaId}`),
};

export const cardapiosApi = {
  list: () => api.get('/cardapios'),
  get: (cardapioId) => api.get(`/cardapios/${cardapioId}`),
  create: (cardapio) => api.post('/cardapios', cardapio),
  update: (cardapioId, cardapio) => api.put(`/cardapios/${cardapioId}`, cardapio),
  remove: (cardapioId) => api.delete(`/cardapios/${cardapioId}`),
};
