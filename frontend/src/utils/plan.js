/**
 * Plan del usuario. La eliminación de cuenta es una función del plan Premium.
 *
 * Mientras no exista una pasarela de pago integrada, el plan se guarda en
 * localStorage. Para simular Premium durante pruebas o demos, ejecuta en la
 * consola del navegador:
 *     localStorage.setItem('tp_plan', 'premium')
 * y recarga la página. Para volver al plan gratis:
 *     localStorage.removeItem('tp_plan')
 */

const PLAN_KEY = 'tp_plan';

export const PLAN_GRATIS = 'gratis';
export const PLAN_PREMIUM = 'premium';

export function getPlan() {
  return localStorage.getItem(PLAN_KEY) === PLAN_PREMIUM ? PLAN_PREMIUM : PLAN_GRATIS;
}

export function isPremium() {
  return getPlan() === PLAN_PREMIUM;
}

export function setPlan(plan) {
  if (plan === PLAN_PREMIUM) localStorage.setItem(PLAN_KEY, PLAN_PREMIUM);
  else localStorage.removeItem(PLAN_KEY);
}
