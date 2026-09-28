/* Cliente HTTP da API: base configurável, token Bearer salvo no navegador e mensagens de erro normalizadas */
import axios from 'axios';

const TOKEN_KEY = 'cf_api_token';
const PROFILE_KEY = 'active_profile_id';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = storage.get(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* Acesso seguro ao localStorage (pode falhar em navegação privada) */
export const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* sem armazenamento persistente: segue só na sessão */
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nada a remover */
    }
  },
};

export const keys = { TOKEN_KEY, PROFILE_KEY };

/* Converte erro do axios em mensagem para a pessoa usuária */
export function errorMessage(error) {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.code === 'ECONNABORTED') return 'A API demorou para responder. Tente novamente.';
  if (!error?.response) return 'Sem conexão com a API. Verifique a internet ou se o servidor está ligado.';
  return 'Algo deu errado. Tente novamente.';
}

export default api;
/* Fim de api.js */
