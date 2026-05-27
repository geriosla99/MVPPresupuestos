/**
 * Reglas y evaluación de fuerza de contraseña.
 * Las mismas reglas se validan en el backend (app/schemas.py).
 */

export const PASSWORD_RULES = [
  { id: 'length',  label: 'Al menos 8 caracteres',          test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Una letra mayúscula (A-Z)',      test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'Una letra minúscula (a-z)',      test: (p) => /[a-z]/.test(p) },
  { id: 'number',  label: 'Un número (0-9)',                test: (p) => /\d/.test(p) },
  { id: 'special', label: 'Un carácter especial (!@#$…)',   test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/**
 * Evalúa una contraseña contra todas las reglas.
 * Devuelve { results, passed, total, allPassed, score (0..1), level, label, color }.
 */
export function evaluatePassword(password) {
  const p = password || '';
  const results = PASSWORD_RULES.map((r) => ({ id: r.id, label: r.label, ok: r.test(p) }));
  const passed = results.filter((r) => r.ok).length;
  const total = PASSWORD_RULES.length;
  const score = total ? passed / total : 0;

  let level = 'débil';
  let color = '#F43F5E';
  if (passed >= total) {
    level = 'fuerte';
    color = '#02C39A';
  } else if (passed >= 3) {
    level = 'media';
    color = '#F59E0B';
  }

  return {
    results,
    passed,
    total,
    allPassed: passed === total,
    score,
    level,
    label: `Seguridad: ${level}`,
    color,
  };
}
