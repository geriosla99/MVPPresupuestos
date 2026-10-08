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

export const getGoalMonthlyPlan = ({
  objetivo = 0,
  montoActual = 0,
  fechaInicio = '',
  fechaLimite = '',
}) => {
  const meta = Number(objetivo) || 0;
  const yaAhorrado = Number(montoActual) || 0;
  const montoPendiente = Math.max(0, meta - yaAhorrado);

  if (!fechaLimite) {
    return {
      montoPendiente,
      mesesDisponibles: 0,
      cuotaMensual: 0,
      cuotasMensuales: [],
      isValid: montoPendiente <= 0,
      message: montoPendiente <= 0
        ? 'La meta ya está cubierta con el ahorro actual.'
        : 'Agrega una fecha límite para calcular el plan de ahorro.',
    };
  }

  const startDate = fechaInicio ? new Date(fechaInicio) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const goalDate = new Date(fechaLimite);
  goalDate.setHours(0, 0, 0, 0);

  const mesesDisponibles = diffMonths(startDate, goalDate);
  const cuotaMensual = montoPendiente > 0 && mesesDisponibles > 0 ? montoPendiente / mesesDisponibles : 0;

  const cuotasMensuales = Array.from({ length: mesesDisponibles }, (_, index) => {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + index);

    return {
      monthKey: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
      label: monthDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
      cuotaMensual,
      montoPendiente,
      requiereAhorrar: cuotaMensual,
      esMesActual: index === 0,
      balanceDisponible: null,
      puedeSoportar: true,
    };
  });

  return {
    montoPendiente,
    mesesDisponibles,
    cuotaMensual,
    cuotasMensuales,
    isValid: montoPendiente <= 0 || cuotaMensual >= 0,
    message: montoPendiente <= 0
      ? 'La meta ya está cubierta con el ahorro actual.'
      : `Debes ahorrar aproximadamente ${formatCOP(cuotaMensual)} al mes durante ${mesesDisponibles} mes${mesesDisponibles === 1 ? '' : 'es'}.`,
  };
};

export function getGoalCapacityAdvice({
  balanceDisponible = 0,
  objetivo = 0,
  montoActual = 0,
  fechaLimite = '',
  capacidadAhorroMensual,
  fechaInicio = '',
  monthlyCapacity = [],
}) {
  const disponible = Number(balanceDisponible) || 0;
  const meta = Number(objetivo) || 0;
  const yaAhorrado = Number(montoActual) || 0;
  const montoPendiente = Math.max(0, meta - yaAhorrado);
  const hasDeadline = Boolean(fechaLimite);
  const capacidadMensual = Number(capacidadAhorroMensual) || disponible;

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
      cuotasMensuales: [],
      message: 'Ingresa un monto objetivo válido para la meta.',
    };
  }

  if (montoPendiente <= 0) {
    return {
      hasDeadline,
      isValid: true,
      puedeGuardar: true,
      montoMaximoPorMes: Math.max(0, capacidadMensual),
      ahorroMensualRequerido: 0,
      mesesRestantes: hasDeadline ? diffMonths(new Date(), new Date(fechaLimite)) : 0,
      necesitaAlargarTiempo: false,
      requiereAjusteFecha: false,
      fechaAjustada: '',
      cuotasMensuales: [],
      message: 'La meta ya está cubierta con el ahorro actual.',
    };
  }

  if (!hasDeadline) {
    return {
      hasDeadline: false,
      isValid: true,
      puedeGuardar: true,
      montoMaximoPorMes: Math.max(0, capacidadMensual),
      ahorroMensualRequerido: 0,
      mesesRestantes: 0,
      necesitaAlargarTiempo: false,
      requiereAjusteFecha: false,
      fechaAjustada: '',
      cuotasMensuales: [],
      message: `Con tu balance disponible de ${formatCOP(disponible)}, tu meta de ${formatCOP(meta)} todavía requiere ${formatCOP(montoPendiente)} por alcanzar.`,
    };
  }

  const plan = getGoalMonthlyPlan({
    objetivo: meta,
    montoActual: yaAhorrado,
    fechaInicio,
    fechaLimite,
  });

  const cuotaMensual = plan.cuotaMensual;
  const capacidadActual = Math.max(0, disponible);
  const esValida = cuotaMensual <= capacidadActual;

  if (!plan.cuotasMensuales.length) {
    return {
      hasDeadline: true,
      isValid: false,
      puedeGuardar: false,
      montoMaximoPorMes: capacidadActual,
      ahorroMensualRequerido: cuotaMensual,
      mesesRestantes: 0,
      necesitaAlargarTiempo: false,
      requiereAjusteFecha: false,
      fechaAjustada: '',
      cuotasMensuales: [],
      message: 'No fue posible calcular el plan de ahorro para esta fecha límite.',
    };
  }

  const cuotasMensuales = plan.cuotasMensuales.map((cuota, index) => ({
    ...cuota,
    balanceDisponible: index === 0 ? capacidadActual : null,
    puedeSoportar: index > 0 || cuota.cuotaMensual <= capacidadActual,
  }));

  if (esValida) {
    return {
      hasDeadline: true,
      isValid: true,
      puedeGuardar: true,
      montoMaximoPorMes: capacidadActual,
      ahorroMensualRequerido: cuotaMensual,
      mesesRestantes: plan.mesesDisponibles,
      necesitaAlargarTiempo: false,
      requiereAjusteFecha: false,
      fechaAjustada: '',
      cuotasMensuales,
      message: `Debes ahorrar aproximadamente ${formatCOP(cuotaMensual)} al mes durante ${plan.mesesDisponibles} mes${plan.mesesDisponibles === 1 ? '' : 'es'}. Tu capacidad actual es ${formatCOP(capacidadActual)} y cumple con la cuota requerida.`,
    };
  }

  return {
    hasDeadline: true,
    isValid: false,
    puedeGuardar: false,
    montoMaximoPorMes: capacidadActual,
    ahorroMensualRequerido: cuotaMensual,
    mesesRestantes: plan.mesesDisponibles,
    necesitaAlargarTiempo: true,
    requiereAjusteFecha: true,
    fechaAjustada: '',
    cuotasMensuales,
    message: `La cuota requerida de ${formatCOP(cuotaMensual)} supera tu capacidad de ahorro actual de ${formatCOP(capacidadActual)}. Puedes reducir la meta o ampliar el plazo.`,
  };
}
