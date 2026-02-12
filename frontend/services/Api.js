import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
const AUTH_TOKEN_KEY = 'auth_session_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generate unique chat session ID per logged-in user/device
const getSessionId = () => {
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
};

export const chatAPI = {
  sendMessage: (message, language = 'en') =>
    api.post('/api/chat/message', {
      message,
      session_id: getSessionId(),
      language,
    }),

  clearSession: () => {
    const sessionId = getSessionId();
    localStorage.removeItem('chatSessionId');
    return api.delete(`/api/chat/session/${sessionId}`);
  },

  checkHealth: () => api.get('/api/chat/health'),
};

export const authAPI = {
  requestLogin: (payload, frontendBaseUrl) =>
    api.post('/api/auth/request-login', {
      ...payload,
      frontend_base_url: frontendBaseUrl,
    }),

  verifyMagicLink: (token) =>
    api.get('/api/auth/verify', {
      params: { token },
    }),

  me: () => api.get('/api/auth/me'),
};

export default api;
