/**
 * Helpers de formato — mismas reglas usadas en el mockup original.
 */

// Muestra enteros sin decimales y, cuando el monto tiene decimales,
// hasta 2 cifras decimales. Soporta montos muy pequeños y muy grandes.
export const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0);

export const today = () => new Date().toISOString().split('T')[0];

/**
 * Fecha mínima permitida en los formularios (ingresos, gastos, metas):
 * 1° de enero del año en curso. Evita registrar movimientos en años
 * anteriores y mantiene los datos coherentes con el resumen anual.
 */
export const startOfYear = () => {
  const y = new Date().getFullYear();
  return `${y}-01-01`;
};

/**
 * Fecha máxima permitida en los formularios: hoy + N años (por defecto 10).
 * Útil para planificación a largo plazo (metas de ahorro, ingresos
 * programados, gastos recurrentes) sin abrir la puerta a errores
 * tipográficos con fechas absurdas (ej. año 9999).
 */
export const maxDate = (years = 10) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
};

export const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Metadatos por categoría — replica el catMeta del mockup.
 * Permite al frontend renderizar íconos/colores incluso si el backend
 * solo devuelve el nombre de la categoría.
 */
export const catMeta = {
  Vivienda:        { icon: '🏠', cls: 'cat-housing',   color: '#7C3AED' },
  Alimentación:    { icon: '🛒', cls: 'cat-food',      color: '#059669' },
  Transporte:      { icon: '🚌', cls: 'cat-transport', color: '#0EA5E9' },
  Salud:           { icon: '🏥', cls: 'cat-health',    color: '#F43F5E' },
  Educación:       { icon: '📚', cls: 'cat-other',     color: '#F59E0B' },
  Entretenimiento: { icon: '🎮', cls: 'cat-other',     color: '#EC4899' },
  Ropa:            { icon: '👗', cls: 'cat-other',     color: '#6366F1' },
  Servicios:       { icon: '💡', cls: 'cat-other',     color: '#14B8A6' },
  Otro:            { icon: '📦', cls: 'cat-other',     color: '#94A3B8' },
  Salario:         { icon: '💼', cls: 'cat-salary',    color: '#F59E0B' },
  Freelance:       { icon: '💻', cls: 'cat-freelance', color: '#EC4899' },
  Negocio:         { icon: '🏪', cls: 'cat-other',     color: '#14B8A6' },
  Inversión:       { icon: '📈', cls: 'cat-other',     color: '#6366F1' },
};

export const getCat = (name) =>
  catMeta[name] || { icon: '📦', cls: 'cat-other', color: '#94A3B8' };

export const CATEGORIAS_GASTO = [
  { value: 'Vivienda', label: '🏠 Vivienda' },
  { value: 'Alimentación', label: '🛒 Alimentación' },
  { value: 'Transporte', label: '🚌 Transporte' },
  { value: 'Salud', label: '🏥 Salud' },
  { value: 'Educación', label: '📚 Educación' },
  { value: 'Entretenimiento', label: '🎮 Entretenimiento' },
  { value: 'Ropa', label: '👗 Ropa' },
  { value: 'Servicios', label: '💡 Servicios' },
  { value: 'Otro', label: '📦 Otro' },
];

export const CATEGORIAS_INGRESO = [
  { value: 'Salario', label: '💼 Salario' },
  { value: 'Freelance', label: '💻 Freelance' },
  { value: 'Negocio', label: '🏪 Negocio' },
  { value: 'Inversión', label: '📈 Inversión' },
  { value: 'Otro', label: '📦 Otro' },
];
