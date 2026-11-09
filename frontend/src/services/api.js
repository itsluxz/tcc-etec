import axios from 'axios';
import Constants from 'expo-constants';

const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? '127.0.0.1';
const configuredBaseURL = process.env.EXPO_PUBLIC_API_URL?.trim();

export const apiBaseURL = (configuredBaseURL || `http://${host}:8000`).replace(/\/+$/, '');

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
});

export default api;
