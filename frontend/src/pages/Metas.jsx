import { useEffect, useState } from 'react';
import { goalsApi } from '../api/goals';
import { formatCOP, formatDate, today } from '../utils/format';

const ICONOS_METAS = ['🎯', '✈️', '🏠', '🚗', '🎓', '💍', '💻', '🏖️', '🎁', '📈'];

export default function Metas() {
  const empty = {
    nombre: '',
    monto_objetivo: '',
    monto_actual: '0',
    icono: '🎯',
    fecha_limite: '',
  };

  const [items, setItems] = useState([]);
  const [form, setForm]   = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Estado para "aportar" (suma al acumulado)
  const [contribFor, setContribFor] = useState(null); // id de la meta
  const [contribMonto, setContribMonto] = useState('');

  // Estado para "ajustar" (fija el acumulado a un valor exacto)
  const [adjustFor, setAdjustFor] = useState(null);
  const [adjustMonto, setAdjustMonto] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalsApi.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'No pudimos cargar tus metas de ahorro.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(empty);
    setEditingId(null);
  };

  const handleEdit = (g) => {
    setEditingId(g.id);
    setForm({
      nombre:         g.nombre || '',
      monto_objetivo: g.monto_objetivo ?? '',
      monto_actual:   g.monto_actual   ?? 0,
      icono:          g.icono || '🎯',
      fecha_limite:   (g.fecha_limite || '').slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim() || !form.monto_objetivo) {
      setError('Necesitas un nombre y un monto objetivo.');
      return;
    }
    const objetivo = Number(form.monto_objetivo);
    const actual   = Number(form.monto_actual || 0);
    if (Number.isNaN(objetivo) || objetivo <= 0) {
      setError('El monto objetivo debe ser mayor a cero.');
      return;
    }
    if (actual < 0) {
      setError('El monto actual no puede ser negativo.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nombre:         form.nombre.trim(),
        monto_objetivo: objetivo,
        monto_actual:   actual,
        icono:          form.icono,
        fecha_limite:   form.fecha_limite || null,
      };

      if (editingId) {
        const updated = await goalsApi.update(editingId, payload);
        setItems((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
      } else {
        const created = await goalsApi.create(payload);
        setItems((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.detail || 'No pudimos guardar tu meta.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta meta? Perderás su progreso.')) return;
    try {
      await goalsApi.remove(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'No pudimos eliminar la meta.');
    }
  };

  const handleContribute = async (id) => {
    const monto = Number(contribMonto);
    if (Number.isNaN(monto) || monto <= 0) {
      setError('Ingresa un monto válido para aportar.');
      return;
    }
    try {
      const updated = await goalsApi.contribute(id, monto);
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      setContribFor(null);
      setContribMonto('');
    } catch (err) {
      setError(err.response?.data?.detail || 'No pudimos registrar tu aporte.');
    }
  };

  /**
   * Ajusta el acumulado: reemplaza monto_actual por el valor exacto que ingrese
   * el usuario (a diferencia de "aportar" que lo suma). Útil cuando el saldo real
   * difiere de lo que está registrado en la meta.
   */
  const handleAdjust = async (g) => {
    const monto = Number(adjustMonto);
    if (adjustMonto === '' || Number.isNaN(monto) || monto < 0) {
      setError('Ingresa un acumulado válido (debe ser cero o mayor).');
      return;
    }
    try {
      const updated = await goalsApi.update(g.id, {
        nombre:         g.nombre,
        monto_objetivo: Number(g.monto_objetivo) || 0,
        monto_actual:   monto,
        icono:          g.icono || '🎯',
        fecha_limite:   g.fecha_limite || null,
      });
      setItems((prev) => prev.map((x) => (x.id === g.id ? updated : x)));
      setAdjustFor(null);
      setAdjustMonto('');
    } catch (err) {
      setError(err.response?.data?.detail || 'No pudimos ajustar el acumulado.');
    }
  };

  return (
    <>
      <form className="form-card" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Editar meta' : 'Nueva meta de ahorro'}</h3>

        {error && <div className="alert-banner danger">⚠️ {error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la meta</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Viaje a Cartagena"
              value={form.nombre}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="icono">Ícono</label>
            <select
              id="icono"
              name="icono"
              value={form.icono}
              onChange={handleChange}
              disabled={submitting}
            >
              {ICONOS_METAS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row three">
          <div className="form-group">
            <label htmlFor="monto_objetivo">Monto objetivo (COP)</label>
            <input
              id="monto_objetivo"
              name="monto_objetivo"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={form.monto_objetivo}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="monto_actual">Ya tienes ahorrado</label>
            <input
              id="monto_actual"
              name="monto_actual"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={form.monto_actual}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha_limite">Fecha límite (opcional)</label>
            <input
              id="fecha_limite"
              name="fecha_limite"
              type="date"
              min={today()}
              value={form.fecha_limite}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear meta'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={resetForm}
              disabled={submitting}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="section-header">
        <div className="section-title">
          Tus metas · {items.length} activa{items.length === 1 ? '' : 's'}
        </div>
      </div>

      {loading ? (
        <div className="loader">Cargando metas…</div>
      ) : items.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎯</div>
          Aún no tienes metas. Crea la primera arriba — ahorrar es más fácil con un objetivo claro.
        </div>
      ) : (
        <div className="goals-grid">
          {items.map((g) => {
            const objetivo = Number(g.monto_objetivo) || 0;
            const actual   = Number(g.monto_actual)   || 0;
            const pct      = objetivo > 0 ? Math.min(100, Math.round((actual / objetivo) * 100)) : 0;
            const fillColor =
              pct >= 100 ? '#02C39A' :
              pct >= 50  ? '#0EA5E9' :
                           '#F59E0B';

            return (
              <div className="goal-card" key={g.id}>
                <button
                  className="goal-del"
                  type="button"
                  onClick={() => handleDelete(g.id)}
                  aria-label="Eliminar meta"
                >
                  🗑
                </button>

                <div className="goal-icon">{g.icono || '🎯'}</div>
                <div className="goal-name">{g.nombre}</div>
                <div className="goal-amounts mono">
                  {formatCOP(actual)} / {formatCOP(objetivo)}
                </div>

                <div className="goal-track">
                  <div
                    className="goal-fill"
                    style={{ width: `${pct}%`, background: fillColor }}
                  />
                </div>
                <div className="goal-pct" style={{ color: fillColor }}>
                  {pct}% completado
                  {g.fecha_limite ? ` · meta para ${formatDate(g.fecha_limite)}` : ''}
                </div>

                {/* Acciones */}
                <div className="form-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn-sm-action"
                    onClick={() => handleEdit(g)}
                  >
                    Editar
                  </button>

                  {contribFor === g.id ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        placeholder="Monto a aportar"
                        value={contribMonto}
                        onChange={(e) => setContribMonto(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          border: '1.5px solid var(--border)',
                          borderRadius: 8,
                          fontSize: '.85rem',
                          flex: 1,
                          minWidth: 120,
                        }}
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '.8rem' }}
                        onClick={() => handleContribute(g.id)}
                      >
                        Aportar
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        style={{ padding: '6px 14px', fontSize: '.8rem' }}
                        onClick={() => { setContribFor(null); setContribMonto(''); }}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : adjustFor === g.id ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        placeholder="Nuevo acumulado"
                        value={adjustMonto}
                        onChange={(e) => setAdjustMonto(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          border: '1.5px solid var(--border)',
                          borderRadius: 8,
                          fontSize: '.85rem',
                          flex: 1,
                          minWidth: 120,
                        }}
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '.8rem' }}
                        onClick={() => handleAdjust(g)}
                      >
                        Ajustar
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        style={{ padding: '6px 14px', fontSize: '.8rem' }}
                        onClick={() => { setAdjustFor(null); setAdjustMonto(''); }}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-sm-action"
                        onClick={() => { setContribFor(g.id); setContribMonto(''); }}
                      >
                        + Aportar
                      </button>
                      <button
                        type="button"
                        className="btn-sm-action"
                        onClick={() => {
                          setAdjustFor(g.id);
                          setAdjustMonto(String(Number(g.monto_actual) || 0));
                        }}
                        title="Reemplazar el acumulado por un valor exacto"
                      >
                        ✎ Ajustar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
