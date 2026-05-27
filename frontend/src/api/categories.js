import api from './axios';

/**
 * Endpoints de categorías personalizadas.
 * Contrato esperado:
 *   GET    /categories?tipo=ingreso|gasto   → Category[]
 *   POST   /categories                       → Category
 *   PUT    /categories/{id}                   → Category
 *   DELETE /categories/{id}                   → 204
 *
 * Modelo Category:
 *   { id, nombre, tipo: 'ingreso'|'gasto', icono }
 */

export const categoriesApi = {
  list: (tipo) =>
    api.get('/categories', { params: tipo ? { tipo } : {} }).then((r) => r.data),

  create: (data) => api.post('/categories', data).then((r) => r.data),

  update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),

  remove: (id) => api.delete(`/categories/${id}`),
};
