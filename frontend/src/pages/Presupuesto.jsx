import { useEffect, useMemo, useState } from 'react';
import { budgetApi } from '../api/budget';
import { formatCOP, getCat, CATEGORIAS_GASTO } from '../utils/format';

/**
 * Devuelve el mes actual en formato YYYY-MM.
 */
const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function Presupuesto() {
  const [month, setMonth] = useState(currentMonth());
  const [items, setItems] = useState([]); // [{ categoria, limite_mensual, gastado }]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /**
   * Combina lo recibido del backend con todas las categorías de gasto,
   * para que el usuario pueda asignar límite a cualquiera, aun si no la usaba.
   */
  const mergeWithCategories = (received) => {
    const map = new Map(received.map((it) => [it.categoria, it]));
    return CATEGORIAS_GASTO.map((c) => {
      const existing = map.get(c.value);
      return existing
        ? {
            categoria:       c.value,
            limite_mensual:  Number(existing.limite_mensual) || 0,
            gastado:         Number(existing.gastado)        || 0,
          }
        : { categoria: c.value, limite_mensual: 0, gastado: 0 };
    });
  };

  const load = async (m) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await budgetApi.get(m);
      setItems(mergeWithCategories(Array.isArray(data) ? data : []));
    } catch (err) {
      setError(
        err.response?.data?.detail || 'No pudimos cargar tu presupuesto.'
      );
      // aún sin datos, preparamos los inputs en cero
      setItems(mergeWithCategories([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const handleLimitChange = (categoria, value) => {
    const num = value === '' ? 0 : Number(value);
    if (Number.isNaN(num) || num < 0) return;
    setItems((prev) =>
      prev.map((it) =>
        it.categoria === categoria ? { ...it, limite_mensual: num } : it
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = items
        .filter((it) => it.limite_mensual > 0) // solo enviamos límites con valor
        .map((it) => ({
          categoria:      it.categoria,
          limite_mensual: it.limite_mensual,
        }));
      const updated = await budgetApi.upsert(payload, month);
      setItems(mergeWithCategories(Array.isArray(updated) ? updated : []));
      setSuccess('Presupuesto guardado correctamente.');
    } catch (err) {
      setError(
        err.response?.data?.detail || 'No pudimos guardar el presupuesto.'
      );
    } finally {
      setSaving(false);
    }
  };

  const totales = useMemo(() => {
    const limite  = items.reduce((a, it) => a + (it.limite_mensual || 0), 0);
    const gastado = items.reduce((a, it) => a + (it.gastado        || 0), 0);
    return { limite, gastado, restante: limite - gastado };
  }, [items]);

  const excedidas = items.filter(
    (it) => it.limite_mensual > 0 && it.gastado > it.limite_mensual
  );

  return (
    <>
      <div className="form-card">
        <h3>Selecciona el mes</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="month">Mes</label>
            <input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Resumen</label>
            <div className="mono" style={{ paddingTop: 6 }}>
              Límite total: <b>{formatCOP(totales.limite)}</b> · Gastado:{' '}
              <b style={{ color: totales.gastado > totales.limite ? '#E11D48' : '#059669' }}>
                {formatCOP(totales.gastado)}
              </b>
            </div>
          </div>
        </div>
      </div>

      {error   && <div className="alert-banner danger">⚠️ {error}</div>}
      {success && <div className="alert-banner">✅ {success}</div>}

      {excedidas.length > 0 && (
        <div className="alert-banner danger">
          ⚠️ Te excediste en {excedidas.length} categoría
          {excedidas.length === 1 ? '' : 's'}: {excedidas.map((e) => e.categoria).join(', ')}.
        </div>
      )}

      {loading ? (
        <div className="loader">Cargando presupuesto…</div>
      ) : (
        <>
          <div className="form-card">
            <h3>Límites por categoría</h3>

            {items.map((it) => {
              const meta = getCat(it.categoria);
              const pct = it.limite_mensual > 0
                ? Math.min(100, Math.round((it.gastado / it.limite_mensual) * 100))
                : 0;
              const overspent = it.limite_mensual > 0 && it.gastado > it.limite_mensual;
              const fillColor =
                overspent       ? '#E11D48' :
                pct >= 80       ? '#F59E0B' :
                                  meta.color;

              return (
                <div className="cat-bar" key={it.categoria} style={{ marginBottom: 18 }}>
                  <div className="cat-bar-header" style={{ alignItems: 'center', gap: 12 }}>
                    <span className="cat-bar-name">
                      {meta.icon} {it.categoria}
                    </span>
                    <span className="cat-bar-pct mono">
                      {formatCOP(it.gastado)} de {formatCOP(it.limite_mensual)} · {pct}%
                    </span>
                  </div>

                  <div className="cat-bar-track" style={{ marginBottom: 8 }}>
                    <div
                      className="cat-bar-fill"
                      style={{ width: `${pct}%`, background: fillColor }}
                    />
                  </div>

                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group">
                      <label htmlFor={`lim-${it.categoria}`}>
                        Límite mensual (COP)
                      </label>
                      <input
                        id={`lim-${it.categoria}`}
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={it.limite_mensual || ''}
                        onChange={(e) => handleLimitChange(it.categoria, e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="form-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando…' : 'Guardar presupuesto'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => load(month)}
                disabled={saving}
              >
                Descartar cambios
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
