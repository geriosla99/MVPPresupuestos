import { useEffect, useState } from 'react';
import { categoriesApi } from '../api/categories';
import { transactionsApi } from '../api/transactions';

const ICONOS = ['🏷️', '🛒', '🏠', '🚗', '🍔', '💊', '🎓', '🎮', '👗', '💡',
                '💼', '💻', '🏪', '📈', '🎁', '✈️', '🐾', '📱'];

/**
 * Configuración — gestión de categorías personalizadas y datos/privacidad.
 */
export default function Configuracion() {
  // ─────────────── Categorías ───────────────
  const [tab, setTab] = useState('gasto');           // 'gasto' | 'ingreso'
  const [cats, setCats] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catError, setCatError] = useState(null);

  const empty = { nombre: '', tipo: 'gasto', icono: '🏷️' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [savingCat, setSavingCat] = useState(false);

  const loadCats = async () => {
    setLoadingCats(true);
    setCatError(null);
    try {
      const data = await categoriesApi.list();
      setCats(Array.isArray(data) ? data : []);
    } catch (err) {
      setCatError(err.response?.data?.detail || 'No pudimos cargar las categorías.');
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => { loadCats(); }, []);

  const resetForm = () => {
    setForm({ ...empty, tipo: tab });
    setEditingId(null);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ nombre: c.nombre, tipo: c.tipo, icono: c.icono || '🏷️' });
    setTab(c.tipo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitCat = async (e) => {
    e.preventDefault();
    setCatError(null);
    if (!form.nombre.trim()) {
      setCatError('La categoría necesita un nombre.');
      return;
    }
    setSavingCat(true);
    try {
      const payload = { ...form, nombre: form.nombre.trim(), tipo: editingId ? form.tipo : tab };
      if (editingId) {
        const updated = await categoriesApi.update(editingId, payload);
        setCats((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
      } else {
        const created = await categoriesApi.create(payload);
        setCats((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setCatError(err.response?.data?.detail || 'No pudimos guardar la categoría.');
    } finally {
      setSavingCat(false);
    }
  };

  const deleteCat = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría personalizada?')) return;
    try {
      await categoriesApi.remove(id);
      setCats((prev) => prev.filter((x) => x.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setCatError(err.response?.data?.detail || 'No pudimos eliminar la categoría.');
    }
  };

  const visibleCats = cats.filter((c) => c.tipo === tab);

  // ─────────────── Borrar movimientos ───────────────
  const [dataMsg, setDataMsg] = useState(null);
  const [purgeText, setPurgeText] = useState('');
  const [purging, setPurging] = useState(false);

  const purgeMovements = async () => {
    if (purgeText !== 'BORRAR') return;
    setPurging(true);
    setDataMsg(null);
    try {
      await transactionsApi.removeAll();
      setDataMsg({ type: 'ok', text: 'Se eliminaron todos tus movimientos.' });
      setPurgeText('');
    } catch (err) {
      setDataMsg({ type: 'error', text: 'No pudimos borrar los movimientos.' });
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="stack-lg">
      {/* ─── Gestión de categorías ─── */}
      <div className="form-card">
        <h3>🏷️ Categorías personalizadas</h3>
        <p className="card-help">
          Crea tus propias categorías. Aparecerán como opción al registrar
          ingresos y gastos, junto a las predefinidas.
        </p>

        {catError && <div className="alert-banner danger">⚠️ {catError}</div>}

        <div className="seg-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'gasto'}
            className={tab === 'gasto' ? 'seg-tab active' : 'seg-tab'}
            onClick={() => { setTab('gasto'); resetForm(); }}
          >
            💸 Gastos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'ingreso'}
            className={tab === 'ingreso' ? 'seg-tab active' : 'seg-tab'}
            onClick={() => { setTab('ingreso'); resetForm(); }}
          >
            💵 Ingresos
          </button>
        </div>

        <form onSubmit={submitCat} style={{ marginTop: 16 }}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cat-nombre">
                {editingId ? 'Editar categoría' : `Nueva categoría de ${tab}`}
              </label>
              <input
                id="cat-nombre"
                type="text"
                placeholder="Ej. Mascotas, Suscripciones…"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                disabled={savingCat}
              />
            </div>
            <div className="form-group">
              <label>Ícono</label>
              <div className="icon-picker">
                {ICONOS.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    className={form.icono === ic ? 'icon-opt active' : 'icon-opt'}
                    onClick={() => setForm({ ...form, icono: ic })}
                    aria-label={`Ícono ${ic}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={savingCat}>
              {savingCat ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar categoría'}
            </button>
            {editingId && (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="section-header" style={{ marginTop: 18 }}>
          <div className="section-title">
            Tus categorías de {tab} · {visibleCats.length}
          </div>
        </div>

        {loadingCats ? (
          <div className="loader">Cargando categorías…</div>
        ) : visibleCats.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🏷️</div>
            Aún no tienes categorías personalizadas de {tab}.
          </div>
        ) : (
          <div className="chip-grid">
            {visibleCats.map((c) => (
              <div className="cat-chip" key={c.id}>
                <span className="cat-chip-icon">{c.icono || '🏷️'}</span>
                <span className="cat-chip-name">{c.nombre}</span>
                <button
                  type="button"
                  className="cat-chip-btn"
                  onClick={() => startEdit(c)}
                  aria-label="Editar"
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="cat-chip-btn danger"
                  onClick={() => deleteCat(c.id)}
                  aria-label="Eliminar"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Datos y privacidad: borrar movimientos ─── */}
      <div className="form-card danger-zone">
        <h3>🧹 Borrar todos los movimientos</h3>
        <p className="card-help">
          Elimina permanentemente todos tus ingresos y gastos. Tus metas,
          presupuesto y categorías no se ven afectados. No se puede deshacer.
        </p>

        {dataMsg && (
          <div className={`alert-banner ${dataMsg.type === 'error' ? 'danger' : ''}`}>
            {dataMsg.type === 'error' ? '⚠️' : '✅'} {dataMsg.text}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="purge-confirm">
            Escribe <strong>BORRAR</strong> para confirmar
          </label>
          <input
            id="purge-confirm"
            type="text"
            placeholder="BORRAR"
            value={purgeText}
            onChange={(e) => setPurgeText(e.target.value)}
            disabled={purging}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-danger"
            onClick={purgeMovements}
            disabled={purgeText !== 'BORRAR' || purging}
          >
            {purging ? 'Borrando…' : 'Borrar todos los movimientos'}
          </button>
        </div>
      </div>
    </div>
  );
}
