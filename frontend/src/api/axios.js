import axios from 'axios';

/**
 * Cliente HTTP central
 * - baseURL configurable mediante REACT_APP_API_URL (.env)
 * - Adjunta automáticamente el JWT en cada petición si existe en localStorage
 * - Cierra sesión si el backend responde 401 (token inválido o expirado)
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de petición → añade Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta → manejo global de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tp_token');
      localStorage.removeItem('tp_user');
      // Solo redirigimos si no estábamos ya en /login
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
