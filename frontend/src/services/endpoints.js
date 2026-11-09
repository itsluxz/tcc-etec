import api from './api';

export const authenticationApi = {
  login: (credentials) => api.post('/login', credentials),
};

export const cardapiosApi = {
  list: () => api.get('/cardapios'),
  get: (cardapioId) => api.get(`/cardapios/${cardapioId}`),
  create: (cardapio) => api.post('/cardapios', cardapio),
  update: (cardapioId, cardapio) => api.put(`/cardapios/${cardapioId}`, cardapio),
  remove: (cardapioId) => api.delete(`/cardapios/${cardapioId}`),
};
