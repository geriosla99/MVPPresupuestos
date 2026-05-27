import api from './axios';

/**
 * Endpoints de autenticación.
 * Contrato esperado del backend (FastAPI):
 *   POST   /auth/register          { email, password, nombre }       → { id, email, nombre }
 *   POST   /auth/login             { email, password }               → { access_token, token_type, user }
 *   GET    /auth/me                                                  → { id, email, nombre }
 *   POST   /auth/change-password   { current_password, new_password } → 204
 *   DELETE /auth/me                                                  → 204
 */

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),

  changePassword: (data) => api.post('/auth/change-password', data),

  deleteAccount: () => api.delete('/auth/me'),
};
