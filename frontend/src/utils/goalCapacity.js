import { formatDate } from './format';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const formatCOP = (value) => currency.format(Number(value) || 0);

const diffMonths = (fromDate, toDate) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.max(1, months || 1);
};

export const addMonths = (baseDate, months) => {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() + Math.max(1, Number(months) || 1));
  return date;
};

export const getMinimumMonthsForGoal = ({ objetivo = 0, capacidadAhorroMensual = 0 }) => {
  const meta = Number(objetivo) || 0;
  const capacidadMensual = Number(capacidadAhorroMensual) || 0;

  if (meta <= 0 || capacidadMensual <= 0) return 0;

  let months = 1;
  while (meta / months > capacidadMensual) {
    months += 1;
  }

  return months;
};

export function getGoalCapacityAdvice({
  balanceDisponible = 0,
  objetivo = 0,
  fechaLimite = '',
  capacidadAhorroMensual,
}) {
  const disponible = Number(balanceDisponible) || 0;
  const meta = Number(objetivo) || 0;
  const hasDeadline = Boolean(fechaLimite);
  const capacidadMensual = Number(capacidadAhorroMensual) || 0;

  if (meta <= 0) {
    return {
      hasDeadline,
      isValid: false,
      puedeGuardar: false,
      montoMaximoPorMes: 0,
      ahorroMensualRequerido: 0,
      mesesRestantes: 0,
      necesitaAlargarTiempo: false,
      requiereAjusteFecha: false,
      fechaAjustada: '',
      message: 'Ingresa un monto objetivo válido para la meta.',
    };
  }

  if (meta > disponible) {
    return {
      hasDeadline,
      isValid: false,
      puedeGuardar: false,
      montoMaximoPorMes: Math.max(0, capacidadMensual),
      ahorroMensualRequerido: meta,
      mesesRestantes: hasDeadline ? diffMonths(new Date(), new Date(fechaLimite)) : 0,
      necesitaAlargarTiempo: false,
      requiereAjusteFecha: false,
      fechaAjustada: '',
      message: 'El monto de la meta no puede superar tu balance disponible.',
    };
  }

  if (capacidadMensual <= 0) {
    return {
      hasDeadline,
      isValid: false,
      puedeGuardar: false,
      montoMaximoPorMes: 0,
      ahorroMensualRequerido: hasDeadline ? meta / Math.max(1, diffMonths(new Date(), new Date(fechaLimite))) : meta,
      mesesRestantes: hasDeadline ? diffMonths(new Date(), new Date(fechaLimite)) : 0,
      necesitaAlargarTiempo: false,
      requiereAjusteFecha: false,
      fechaAjustada: '',
      message: 'Actualmente no existe capacidad de ahorro suficiente para establecer esa meta.',
    };
  }

  if (!hasDeadline) {
    return {
      hasDeadline: false,
      isValid: true,
      puedeGuardar: true,
      montoMaximoPorMes: capacidadMensual,
      ahorroMensualRequerido: 0,
      mesesRestantes: 0,
      necesitaAlargarTiempo: false,
      requiereAjusteFecha: false,
      fechaAjustada: '',
      message: `Con tu balance disponible de ${formatCOP(disponible)}, tu meta de ${formatCOP(meta)} no excede la capacidad de ahorro actual.`,
    };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaObjetivo = new Date(fechaLimite);
  const mesesRestantes = diffMonths(hoy, fechaObjetivo);
  const montoMaximoPorMes = Math.max(0, capacidadMensual);
  const ahorroMensualRequerido = Math.max(0, meta / mesesRestantes);
  const necesitaAlargarTiempo = ahorroMensualRequerido > montoMaximoPorMes;
  const mesesNecesarios = getMinimumMonthsForGoal({
    objetivo: meta,
    capacidadAhorroMensual: montoMaximoPorMes,
  });
  const fechaAjustada = necesitaAlargarTiempo
    ? addMonths(hoy, mesesNecesarios).toISOString().slice(0, 10)
    : '';

  const isValid = !necesitaAlargarTiempo;

  let message = '';

  if (isValid) {
    message = `Con un balance disponible de ${formatCOP(disponible)} y ${mesesRestantes} mes${mesesRestantes === 1 ? '' : 'es'} para cumplirla, puedes ahorrar hasta ${formatCOP(montoMaximoPorMes)} por mes. Tu meta requiere ${formatCOP(ahorroMensualRequerido)} al mes, y está dentro de la capacidad.`;
  } else {
    message = `Tu meta requiere ${formatCOP(ahorroMensualRequerido)} al mes, pero tu capacidad actual es ${formatCOP(montoMaximoPorMes)}. Ajustamos la fecha propuesta a ${formatDate(fechaAjustada)} para mantenerla viable.`;
  }

  return {
    hasDeadline: true,
    isValid,
    puedeGuardar: isValid,
    montoMaximoPorMes,
    ahorroMensualRequerido,
    mesesRestantes,
    necesitaAlargarTiempo,
    requiereAjusteFecha: necesitaAlargarTiempo,
    fechaAjustada,
    mesesNecesarios,
    message,
  };
}
