import { getGoalCapacityAdvice } from './goalCapacity';

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

describe('getGoalCapacityAdvice', () => {
  it('calcula el monto pendiente y la cuota mensual sobre el ahorro faltante', () => {
    const futureDate = addMonths(new Date(), 8);

    const advice = getGoalCapacityAdvice({
      balanceDisponible: 250000,
      objetivo: 2000000,
      montoActual: 500000,
      fechaLimite: futureDate.toISOString().slice(0, 10),
      capacidadAhorroMensual: 250000,
      fechaInicio: new Date().toISOString().slice(0, 10),
    });

    expect(advice.ahorroMensualRequerido).toBeCloseTo(187500, 0);
    expect(advice.mesesRestantes).toBeGreaterThanOrEqual(8);
    expect(advice.message).toMatch(/Debes ahorrar|aproximadamente/i);
  });

  it('valida solo la capacidad real del mes actual', () => {
    const futureDate = addMonths(new Date(), 5);

    const advice = getGoalCapacityAdvice({
      balanceDisponible: 180000,
      objetivo: 1000000,
      montoActual: 0,
      fechaLimite: futureDate.toISOString().slice(0, 10),
      capacidadAhorroMensual: 180000,
      fechaInicio: new Date().toISOString().slice(0, 10),
    });

    expect(advice.isValid).toBe(false);
    expect(advice.puedeGuardar).toBe(false);
    expect(advice.message).toMatch(/capacidad de ahorro actual|supera tu capacidad/i);
    expect(advice.cuotasMensuales.slice(1).every((cuota) => cuota.balanceDisponible === null)).toBe(true);
  });

  it('permite guardar cuando la cuota del mes actual está dentro de la capacidad disponible', () => {
    const futureDate = addMonths(new Date(), 5);

    const advice = getGoalCapacityAdvice({
      balanceDisponible: 250000,
      objetivo: 1000000,
      montoActual: 0,
      fechaLimite: futureDate.toISOString().slice(0, 10),
      capacidadAhorroMensual: 250000,
      fechaInicio: new Date().toISOString().slice(0, 10),
    });

    expect(advice.isValid).toBe(true);
    expect(advice.puedeGuardar).toBe(true);
    expect(advice.ahorroMensualRequerido).toBeCloseTo(200000, 0);
    expect(advice.cuotasMensuales[0].balanceDisponible).toBe(250000);
  });

  it('no genera cuotas negativas cuando ya se ahorró suficiente', () => {
    const futureDate = addMonths(new Date(), 5);

    const advice = getGoalCapacityAdvice({
      balanceDisponible: 500000,
      objetivo: 1000000,
      montoActual: 1000000,
      fechaLimite: futureDate.toISOString().slice(0, 10),
      capacidadAhorroMensual: 500000,
      fechaInicio: new Date().toISOString().slice(0, 10),
    });

    expect(advice.ahorroMensualRequerido).toBe(0);
    expect(advice.puedeGuardar).toBe(true);
    expect(advice.message).toMatch(/ya está cubierta|ya está/i);
  });
});
