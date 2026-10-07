import { getGoalCapacityAdvice } from './goalCapacity';

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

describe('getGoalCapacityAdvice', () => {
  it('recomienda alargar el tiempo cuando el objetivo supera la capacidad mensual', () => {
    const futureDate = addMonths(new Date(), 2);

    const advice = getGoalCapacityAdvice({
      balanceDisponible: 2500000,
      objetivo: 2500000,
      fechaLimite: futureDate.toISOString().slice(0, 10),
      capacidadAhorroMensual: 200000,
    });

    expect(advice.hasDeadline).toBe(true);
    expect(advice.montoMaximoPorMes).toBeGreaterThan(0);
    expect(advice.necesitaAlargarTiempo).toBe(true);
    expect(advice.requiereAjusteFecha).toBe(true);
    expect(advice.fechaAjustada).not.toBe('');
    expect(advice.message).toMatch(/alargar|plazo|mes/i);
  });

  it('no permite exceder el balance disponible aunque la fecha pueda ajustarse', () => {
    const advice = getGoalCapacityAdvice({
      balanceDisponible: 500000,
      objetivo: 800000,
      fechaLimite: '',
      capacidadAhorroMensual: 200000,
    });

    expect(advice.hasDeadline).toBe(false);
    expect(advice.necesitaAlargarTiempo).toBe(false);
    expect(advice.puedeGuardar).toBe(false);
    expect(advice.message).toMatch(/balance|capacidad/i);
  });

  it('bloquea la meta cuando el monto supera el balance disponible', () => {
    const futureDate = addMonths(new Date(), 4);

    const advice = getGoalCapacityAdvice({
      balanceDisponible: 1000000,
      objetivo: 1200000,
      fechaLimite: futureDate.toISOString().slice(0, 10),
      capacidadAhorroMensual: 200000,
    });

    expect(advice.isValid).toBe(false);
    expect(advice.message).toMatch(/balance disponible/i);
    expect(advice.fechaAjustada).toBe('');
  });

  it('ajusta la fecha mínima necesaria para cumplir la capacidad mensual', () => {
    const futureDate = addMonths(new Date(), 4);

    const advice = getGoalCapacityAdvice({
      balanceDisponible: 1200000,
      objetivo: 1200000,
      fechaLimite: futureDate.toISOString().slice(0, 10),
      capacidadAhorroMensual: 200000,
    });

    expect(advice.isValid).toBe(false);
    expect(advice.requiereAjusteFecha).toBe(true);
    expect(advice.mesesRestantes).toBeGreaterThanOrEqual(4);
    expect(advice.mesesNecesarios).toBeGreaterThanOrEqual(6);
    expect(advice.fechaAjustada).not.toBe('');
  });

  it('permite guardar cuando cada mes del periodo tiene capacidad suficiente', () => {
    const now = new Date();
    const futureDate = addMonths(now, 5);
    const monthKeys = Array.from({ length: 5 }, (_, index) => {
      const date = addMonths(now, index);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    const advice = getGoalCapacityAdvice({
      balanceDisponible: 300000,
      objetivo: 1000000,
      fechaLimite: futureDate.toISOString().slice(0, 10),
      capacidadAhorroMensual: 300000,
      fechaInicio: now.toISOString().slice(0, 10),
      monthlyCapacity: monthKeys.map((month, index) => ({
        month,
        balance: [300000, 250000, 300000, 280000, 320000][index],
      })),
    });

    expect(advice.isValid).toBe(true);
    expect(advice.puedeGuardar).toBe(true);
    expect(advice.cuotasMensuales.every((cuota) => cuota.puedeSoportar)).toBe(true);
    expect(advice.cuotasMensuales[0].cuotaMensual).toBe(200000);
  });

  it('bloquea la meta cuando al menos un mes del periodo no alcanza la cuota necesaria', () => {
    const now = new Date();
    const futureDate = addMonths(now, 4);
    const monthKeys = Array.from({ length: 4 }, (_, index) => {
      const date = addMonths(now, index);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    const advice = getGoalCapacityAdvice({
      balanceDisponible: 250000,
      objetivo: 800000,
      fechaLimite: futureDate.toISOString().slice(0, 10),
      capacidadAhorroMensual: 250000,
      fechaInicio: now.toISOString().slice(0, 10),
      monthlyCapacity: monthKeys.map((month, index) => ({
        month,
        balance: [300000, 250000, 180000, 300000][index],
      })),
    });

    expect(advice.isValid).toBe(false);
    expect(advice.puedeGuardar).toBe(false);
    expect(advice.cuotasMensuales.some((cuota) => !cuota.puedeSoportar)).toBe(true);
    expect(advice.message).toMatch(/no.*permite|mes|capacidad/i);
  });
});
