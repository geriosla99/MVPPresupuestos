import api from './axios';

/**
 * Endpoints de transacciones (ingresos y gastos).
 * Contrato esperado:
 *   GET    /transactions?tipo=ingreso|gasto         → Transaction[]
 *   GET    /transactions/recent?limit=5             → Transaction[]
 *   POST   /transactions                            → Transaction
 *   PUT    /transactions/{id}                       → Transaction
 *   DELETE /transactions/{id}                       → 204
 *
 *   GET    /summary?month=YYYY-MM                   → { ingresos, gastos, balance, by_category }
 *   GET    /summary/monthly?months=4                → [{ month, ingresos, gastos }]
 *
 * Modelo Transaction:
 *   { id, tipo: 'ingreso'|'gasto', descripcion, categoria, monto, fecha, nota }
 */

export const transactionsApi = {
  list: (tipo) =>
    api.get('/transactions', { params: tipo ? { tipo } : {} }).then((r) => r.data),

  recent: (limit = 5) =>
    api.get('/transactions/recent', { params: { limit } }).then((r) => r.data),

  create: (data) => api.post('/transactions', data).then((r) => r.data),

  update: (id, data) => api.put(`/transactions/${id}`, data).then((r) => r.data),

  remove: (id) => api.delete(`/transactions/${id}`),
};

export const summaryApi = {
  current: (month) =>
    api.get('/summary', { params: month ? { month } : {} }).then((r) => r.data),

  monthly: (months = 4) =>
    api.get('/summary/monthly', { params: { months } }).then((r) => r.data),
};
