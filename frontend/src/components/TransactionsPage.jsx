import { useEffect, useMemo, useState } from 'react';
import { transactionsApi } from '../api/transactions';
import { formatCOP, formatDate, getCat, today } from '../utils/format';

/**
 * Página genérica de transacciones (Ingresos o Gastos).
 * Props:
 *   tipo: 'ingreso' | 'gasto'
 *   categorias: [{ value, label }]
 *   accentClass: 'income' | 'expense'  (para los estilos de pill)
 */
export default function TransactionsPage({ tipo, categorias, accentClass }) {
  const empty = {
    descripcion: '',
    categoria: categorias[0]?.value || '',
    monto: '',
    fecha: today(),
    nota: '',
  };

  const [items, setItems] = useState([]);
  const [form, setForm]   = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsApi.list(tipo);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'No pudimos cargar tus movimientos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.monto || 0), 0),
    [items]
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(empty);
    setEditingId(null);
  };

  const handleEdit = (it) => {
    setEditingId(it.id);
    setForm({
      descripcion: it.descripcion || '',
      categoria:   it.categoria   || categorias[0]?.value,
      monto:       it.monto ?? '',
      fecha:       (it.fecha || today()).slice(0, 10),
      nota:        it.nota || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.descripcion.trim() || !form.categoria || !form.monto || !form.fecha) {
      setError('Completa descripción, categoría, monto y fecha.');
      return;
    }
    const monto = Number(form.monto);
    if (Number.isNaN(monto) || monto <= 0) {
      setError('El monto debe ser un número mayor a cero.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tipo,
        descripcion: form.descripcion.trim(),
        categoria:   form.categoria,
        monto,
        fecha:       form.fecha,
        nota:        form.nota || null,
      };

      if (editingId) {
        const updated = await transactionsApi.update(editingId, payload);
        setItems((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
      } else {
        const created = await transactionsApi.create(payload);
        setItems((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'No pudimos guardar el movimiento. Intenta de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este movimiento? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await transactionsApi.remove(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(
        err.response?.data?.detail || 'No pudimos eliminar el movimiento.'
      );
    }
  };

  return (
    <>
      {/* Cabecera con total */}
      <div className="detail-header">
        <span className={`card-pill ${accentClass}-pill`}>
          {tipo === 'ingreso' ? '↑ Ingresos' : '↓ Gastos'}
        </span>
        <div className="detail-total mono">{formatCOP(total)}</div>
      </div>

      {/* Formulario */}
      <form className="form-card" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Editar movimiento' : `Registrar ${tipo}`}</h3>

        {error && <div className="alert-banner danger">⚠️ {error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <input
              id="descripcion"
              name="descripcion"
              type="text"
              placeholder={tipo === 'ingreso' ? 'Sueldo de mayo' : 'Mercado de la semana'}
              value={form.descripcion}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              disabled={submitting}
            >
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row three">
          <div className="form-group">
            <label htmlFor="monto">Monto (COP)</label>
            <input
              id="monto"
              name="monto"
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              value={form.monto}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              value={form.fecha}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nota">Nota (opcional)</label>
            <input
              id="nota"
              name="nota"
              type="text"
              placeholder="Detalle extra"
              value={form.nota}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting
              ? 'Guardando…'
              : editingId
                ? 'Guardar cambios'
                : `Agregar ${tipo}`}
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

      {/* Listado */}
      <div className="section-header">
        <div className="section-title">
          Historial · {items.length} movimiento{items.length === 1 ? '' : 's'}
        </div>
      </div>

      {loading ? (
        <div className="loader">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="tx-list">
          <div className="empty">
            <div className="empty-icon">📭</div>
            Aún no has registrado {tipo === 'ingreso' ? 'ingresos' : 'gastos'}. Agrega el primero arriba.
          </div>
        </div>
      ) : (
        <div className="tx-list">
          {items.map((it) => {
            const meta = getCat(it.categoria);
            const isIncome = tipo === 'ingreso';
            return (
              <div className="tx-item" key={it.id}>
                <div className={`tx-icon ${meta.cls}`}>{meta.icon}</div>
                <div className="tx-info">
                  <div className="tx-desc">{it.descripcion}</div>
                  <div className="tx-meta">
                    {it.categoria} · {formatDate(it.fecha)}
                    {it.nota ? ` · ${it.nota}` : ''}
                  </div>
                </div>
                <div className={`tx-amount mono ${isIncome ? 'pos' : 'neg'}`}>
                  {isIncome ? '+' : '-'} {formatCOP(it.monto)}
                </div>
                <button
                  className="btn-sm-action"
                  type="button"
                  onClick={() => handleEdit(it)}
                  style={{ marginLeft: 8 }}
                >
                  Editar
                </button>
                <button
                  className="tx-del"
                  type="button"
                  onClick={() => handleDelete(it.id)}
                  aria-label="Eliminar"
                >
                  🗑
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
