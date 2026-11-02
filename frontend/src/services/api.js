import axios from 'axios';
import Constants from 'expo-constants';

// no celular, 127.0.0.1 é o próprio aparelho: usa o IP do PC que está rodando o Expo
const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? '127.0.0.1';

const api = axios.create({
  baseURL: `http://${host}:8000`,
  timeout: 10000,
});

export default api;
