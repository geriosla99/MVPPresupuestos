import api from './axios';

/**
 * Endpoints de presupuesto mensual.
 * Contrato esperado:
 *   GET    /budget?month=YYYY-MM                → BudgetItem[]
 *   PUT    /budget?month=YYYY-MM                body: BudgetItem[]   → BudgetItem[]
 *
 * Modelo BudgetItem:
 *   { categoria, limite_mensual, gastado }
 */

export const budgetApi = {
  get: (month) => api.get('/budget', { params: month ? { month } : {} }).then((r) => r.data),
  upsert: (items, month) =>
    api.put('/budget', items, { params: month ? { month } : {} }).then((r) => r.data),
};
