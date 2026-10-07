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

const normalizeMonthKey = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const clean = value.trim();
    const monthOnly = clean.match(/^\d{4}-\d{2}$/);
    if (monthOnly) return monthOnly[0];

    const dateValue = new Date(clean);
    if (!Number.isNaN(dateValue.getTime())) {
      return `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, '0')}`;
    }

    return clean.slice(0, 7);
  }

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return '';
  return `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, '0')}`;
};

const resolveMonthlyCapacity = (monthKey, monthlyCapacity = []) => {
  if (!monthKey || !Array.isArray(monthlyCapacity) || monthlyCapacity.length === 0) {
    return 0;
  }

  const candidate = monthlyCapacity.find((item) => {
    const itemMonth = normalizeMonthKey(item?.month || item?.mes || item?.fecha || item?.date || item?.key);
    return itemMonth === monthKey;
  });

  if (!candidate) return 0;

  const balance = Number(candidate.balance ?? candidate.disponible ?? candidate.capacidad ?? candidate.available ?? candidate.value ?? 0) || 0;
  if (balance > 0) return balance;

  const ingresos = Number(candidate.ingresos) || 0;
  const gastos = Number(candidate.gastos) || 0;
  return Math.max(0, ingresos - gastos);
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

export const getGoalMonthlyBreakdown = ({
  objetivo = 0,
  fechaInicio = '',
  fechaLimite = '',
  monthlyCapacity = [],
}) => {
  const meta = Number(objetivo) || 0;

  if (meta <= 0 || !fechaLimite) {
    return {
      mesesDisponibles: 0,
      cuotaMensual: 0,
      cuotasMensuales: [],
      isValid: false,
      message: 'Ingresa un monto objetivo válido y una fecha límite para validar el plazo.',
      mesInvalido: null,
    };
  }

  const startDate = fechaInicio ? new Date(fechaInicio) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const goalDate = new Date(fechaLimite);
  goalDate.setHours(0, 0, 0, 0);

  const mesesDisponibles = diffMonths(startDate, goalDate);
  const cuotaMensual = meta / mesesDisponibles;

  const cuotasMensuales = [];
  const dateCursor = new Date(startDate);

  for (let index = 0; index < mesesDisponibles; index += 1) {
    const monthDate = new Date(dateCursor);
    monthDate.setMonth(monthDate.getMonth() + index);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    const balanceDisponible = resolveMonthlyCapacity(monthKey, monthlyCapacity);
    const puedeSoportar = cuotaMensual <= balanceDisponible;

    cuotasMensuales.push({
      monthKey,
      label: monthDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
      cuotaMensual,
      balanceDisponible,
      puedeSoportar,
    });
  }

  const mesInvalido = cuotasMensuales.find((cuota) => !cuota.puedeSoportar) || null;
  const isValid = !mesInvalido;

  let message = '';
  if (isValid) {
    message = `La cuota requerida es ${formatCOP(cuotaMensual)} mensual durante ${mesesDisponibles} mes${mesesDisponibles === 1 ? '' : 'es'}, y cada mes tiene capacidad suficiente.`;
  } else {
    message = `La cuota requerida de ${formatCOP(cuotaMensual)} mensual no puede cumplirse en ${mesInvalido.label}. Ese mes solo tiene ${formatCOP(mesInvalido.balanceDisponible)} disponible; necesitas ampliar el plazo o reducir la meta.`;
  }

  return {
    mesesDisponibles,
    cuotaMensual,
    cuotasMensuales,
    isValid,
    message,
    mesInvalido,
  };
};

export function getGoalCapacityAdvice({
  balanceDisponible = 0,
  objetivo = 0,
  fechaLimite = '',
  capacidadAhorroMensual,
  fechaInicio = '',
  monthlyCapacity = [],
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
      cuotasMensuales: [],
      message: 'Ingresa un monto objetivo válido para la meta.',
    };
  }

  if (Array.isArray(monthlyCapacity) && monthlyCapacity.length > 0 && hasDeadline) {
    const monthlyBreakdown = getGoalMonthlyBreakdown({
      objetivo: meta,
      fechaInicio,
      fechaLimite,
      monthlyCapacity,
    });

    if (monthlyBreakdown.isValid) {
      return {
        hasDeadline: true,
        isValid: true,
        puedeGuardar: true,
        montoMaximoPorMes: monthlyBreakdown.cuotaMensual,
        ahorroMensualRequerido: monthlyBreakdown.cuotaMensual,
        mesesRestantes: monthlyBreakdown.mesesDisponibles,
        necesitaAlargarTiempo: false,
        requiereAjusteFecha: false,
        fechaAjustada: '',
        cuotasMensuales: monthlyBreakdown.cuotasMensuales,
        message: monthlyBreakdown.message,
      };
    }

    return {
      hasDeadline: true,
      isValid: false,
      puedeGuardar: false,
      montoMaximoPorMes: Math.max(0, capacidadMensual),
      ahorroMensualRequerido: monthlyBreakdown.cuotaMensual,
      mesesRestantes: monthlyBreakdown.mesesDisponibles,
      necesitaAlargarTiempo: true,
      requiereAjusteFecha: true,
      fechaAjustada: '',
      cuotasMensuales: monthlyBreakdown.cuotasMensuales,
      message: monthlyBreakdown.message,
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
      cuotasMensuales: [],
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
      cuotasMensuales: [],
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
      cuotasMensuales: [],
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
    cuotasMensuales: [],
    message,
  };
}
