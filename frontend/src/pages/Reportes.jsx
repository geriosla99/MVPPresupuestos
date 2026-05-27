import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import { summaryApi, transactionsApi } from '../api/transactions';
import { formatCOP, getCat } from '../utils/format';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

/**
 * Reportes — analítica de las finanzas con filtros por periodo.
 * Carga los últimos 24 meses (serie) y todas las transacciones una sola vez,
 * y recalcula todo en memoria según el periodo seleccionado.
 */
const PERIODOS = [
  { id: 'mes',       label: 'Mes actual',  meses: 1 },
  { id: 'trimestre', label: 'Trimestre',   meses: 3 },
  { id: 'semestre',  label: 'Semestre',    meses: 6 },
  { id: 'anio',      label: 'Año',         meses: 12 },
  { id: 'todo',      label: 'Todo',        meses: 24 },
];

const compact = (v) =>
  new Intl.NumberFormat('es-CO', { notation: 'compact' }).format(v);

export default function Reportes() {
  const [periodo, setPeriodo] = useState('trimestre');
  const [monthly, setMonthly] = useState([]);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [m, t] = await Promise.all([
          summaryApi.monthly(24),
          transactionsApi.list(),
        ]);
        setMonthly(Array.isArray(m) ? m : []);
        setTxs(Array.isArray(t) ? t : []);
      } catch (err) {
        setError(
          err.response?.data?.detail || 'No pudimos cargar los reportes.'
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const meses = PERIODOS.find((p) => p.id === periodo)?.meses ?? 3;

  // Serie mensual recortada al periodo
  const serie = useMemo(() => monthly.slice(-meses), [monthly, meses]);

  // Fecha de inicio del periodo (primer día del mes más antiguo de la serie)
  const desde = useMemo(() => {
    if (serie.length) return `${serie[0].month}-01`;
    const d = new Date();
    d.setMonth(d.getMonth() - (meses - 1));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, [serie, meses]);

  // Transacciones dentro del periodo
  const txsPeriodo = useMemo(
    () => txs.filter((t) => (t.fecha || '') >= desde),
    [txs, desde]
  );

  // KPIs del periodo
  const kpis = useMemo(() => {
    let ingresos = 0, gastos = 0;
    for (const t of txsPeriodo) {
      if (t.tipo === 'ingreso') ingresos += Number(t.monto || 0);
      else gastos += Number(t.monto || 0);
    }
    return { ingresos, gastos, balance: ingresos - gastos };
  }, [txsPeriodo]);

  // Gastos por categoría (periodo)
  const porCategoria = useMemo(() => {
    const map = {};
    for (const t of txsPeriodo) {
      if (t.tipo !== 'gasto') continue;
      map[t.categoria] = (map[t.categoria] || 0) + Number(t.monto || 0);
    }
    return Object.entries(map)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  }, [txsPeriodo]);

  // ─── Datasets de gráficos ───
  const barData = {
    labels: serie.map((s) => s.month),
    datasets: [
      { label: 'Ingresos', data: serie.map((s) => s.ingresos || 0), backgroundColor: '#1EA64A', borderRadius: 6 },
      { label: 'Gastos',   data: serie.map((s) => s.gastos || 0),   backgroundColor: '#F43F5E', borderRadius: 6 },
    ],
  };

  const lineData = {
    labels: serie.map((s) => s.month),
    datasets: [
      {
        label: 'Balance mensual',
        data: serie.map((s) => (s.ingresos || 0) - (s.gastos || 0)),
        borderColor: '#1E3A8A',
        backgroundColor: 'rgba(30,58,138,.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const doughnutData = {
    labels: porCategoria.map((c) => c.categoria),
    datasets: [
      {
        data: porCategoria.map((c) => c.total),
        backgroundColor: porCategoria.map((c) => getCat(c.categoria).color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const moneyTooltip = {
    callbacks: { label: (ctx) => ` ${ctx.dataset.label || ctx.label}: ${formatCOP(ctx.parsed.y ?? ctx.parsed)}` },
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } }, tooltip: moneyTooltip },
    scales: {
      y: { beginAtZero: true, ticks: { callback: compact }, grid: { color: '#E2E8F0' } },
      x: { grid: { display: false } },
    },
  };
  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: moneyTooltip },
    scales: {
      y: { ticks: { callback: compact }, grid: { color: '#E2E8F0' } },
      x: { grid: { display: false } },
    },
  };
  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${formatCOP(ctx.parsed)}` } },
    },
  };

  const tasaAhorro = kpis.ingresos > 0
    ? Math.round((kpis.balance / kpis.ingresos) * 100)
    : 0;

  if (loading) return <div className="loader">Generando tus reportes…</div>;
  if (error)   return <div className="alert-banner danger">⚠️ {error}</div>;

  return (
    <div className="stack-lg">
      {/* Filtro de periodo */}
      <div className="seg-tabs seg-tabs-wrap" role="tablist">
        {PERIODOS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={periodo === p.id}
            className={periodo === p.id ? 'seg-tab active' : 'seg-tab'}
            onClick={() => setPeriodo(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs del periodo */}
      <div className="summary-grid">
        <div className="summary-card income">
          <span className="card-pill">↑ Ingresos</span>
          <div className="card-label">Total del periodo</div>
          <div className="card-value mono">{formatCOP(kpis.ingresos)}</div>
          <div className="card-decor" />
        </div>
        <div className="summary-card expense">
          <span className="card-pill">↓ Gastos</span>
          <div className="card-label">Total del periodo</div>
          <div className="card-value mono">{formatCOP(kpis.gastos)}</div>
          <div className="card-decor" />
        </div>
        <div className="summary-card savings">
          <span className="card-pill">💰 Balance</span>
          <div className="card-label">Tasa de ahorro: {tasaAhorro}%</div>
          <div className="card-value mono">{formatCOP(kpis.balance)}</div>
          <div className="card-decor" />
        </div>
      </div>

      {/* Ingresos vs Gastos */}
      <div className="chart-card">
        <div className="chart-title">Ingresos vs Gastos por mes</div>
        <div style={{ height: 300 }}>
          {serie.length > 0 ? (
            <Bar data={barData} options={barOpts} />
          ) : (
            <div className="empty"><div className="empty-icon">📊</div>Sin datos en el periodo.</div>
          )}
        </div>
      </div>

      <div className="charts-row">
        {/* Evolución del balance */}
        <div className="chart-card">
          <div className="chart-title">Evolución del balance</div>
          <div style={{ height: 280 }}>
            {serie.length > 0 ? (
              <Line data={lineData} options={lineOpts} />
            ) : (
              <div className="empty"><div className="empty-icon">📈</div>Sin datos en el periodo.</div>
            )}
          </div>
        </div>

        {/* Distribución de gastos */}
        <div className="chart-card">
          <div className="chart-title">Distribución de gastos</div>
          <div style={{ height: 280 }}>
            {porCategoria.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOpts} />
            ) : (
              <div className="empty"><div className="empty-icon">🍩</div>Sin gastos en el periodo.</div>
            )}
          </div>
        </div>
      </div>

      {/* Ranking de categorías */}
      <div className="chart-card">
        <div className="chart-title">Categorías con más gasto</div>
        {porCategoria.length === 0 ? (
          <div className="empty"><div className="empty-icon">📂</div>Sin gastos registrados en el periodo.</div>
        ) : (
          porCategoria.slice(0, 8).map((c) => {
            const meta = getCat(c.categoria);
            const pct = kpis.gastos > 0 ? Math.round((c.total / kpis.gastos) * 100) : 0;
            return (
              <div className="cat-bar" key={c.categoria}>
                <div className="cat-bar-header">
                  <span className="cat-bar-name">{meta.icon} {c.categoria}</span>
                  <span className="cat-bar-pct mono">{formatCOP(c.total)} · {pct}%</span>
                </div>
                <div className="cat-bar-track">
                  <div className="cat-bar-fill" style={{ width: `${pct}%`, background: meta.color }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
