import api from './axios';

/**
 * Endpoints de metas de ahorro.
 * Contrato esperado:
 *   GET    /goals                 → Goal[]
 *   POST   /goals                 → Goal
 *   PUT    /goals/{id}            → Goal
 *   DELETE /goals/{id}            → 204
 *
 *   POST   /goals/{id}/contribute  body: { monto }   → Goal (suma al monto_actual)
 *
 * Modelo Goal:
 *   { id, nombre, monto_objetivo, monto_actual, icono, fecha_limite }
 */

export const goalsApi = {
  list: () => api.get('/goals').then((r) => r.data),
  create: (data) => api.post('/goals', data).then((r) => r.data),
  update: (id, data) => api.put(`/goals/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/goals/${id}`),
  contribute: (id, monto) =>
    api.post(`/goals/${id}/contribute`, { monto }).then((r) => r.data),
};
