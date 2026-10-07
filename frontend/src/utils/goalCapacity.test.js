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
});
