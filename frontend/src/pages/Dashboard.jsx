import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { summaryApi, transactionsApi } from '../api/transactions';
import { formatCOP, formatDate, getCat } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Dashboard — vista principal autenticada.
 * Llama en paralelo:
 *   GET /summary           → totales del mes y desglose por categoría de gastos
 *   GET /summary/monthly   → últimos 4 meses para la gráfica
 *   GET /transactions/recent?limit=5 → últimas transacciones
 */
export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, m, r] = await Promise.all([
        summaryApi.current(),
        summaryApi.monthly(4),
        transactionsApi.recent(5),
      ]);
      setSummary(s);
      setMonthly(Array.isArray(m) ? m : []);
      setRecent(Array.isArray(r) ? r : []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'No pudimos cargar tu información. Intenta recargar la página.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─── Datos derivados ───
  const ingresos = summary?.ingresos ?? 0;
  const gastos   = summary?.gastos   ?? 0;
  const balance  = summary?.balance ?? (ingresos - gastos);
  const byCat    = summary?.by_category ?? [];

  const totalGastosCat = useMemo(
    () => byCat.reduce((acc, c) => acc + (c.total || 0), 0),
    [byCat]
  );

  const chartData = useMemo(() => ({
    labels: monthly.map((m) => m.month),
    datasets: [
      {
        label: 'Ingresos',
        data: monthly.map((m) => m.ingresos || 0),
        backgroundColor: '#02C39A',
        borderRadius: 8,
      },
      {
        label: 'Gastos',
        data: monthly.map((m) => m.gastos || 0),
        backgroundColor: '#F43F5E',
        borderRadius: 8,
      },
    ],
  }), [monthly]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCOP(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => new Intl.NumberFormat('es-CO', { notation: 'compact' }).format(v),
        },
        grid: { color: '#E2E8F0' },
      },
      x: { grid: { display: false } },
    },
  };

  if (loading) return <div className="loader">Cargando tu panel…</div>;
  if (error)   return <div className="alert-banner danger">⚠️ {error}</div>;

  return (
    <>
      {/* Tarjetas resumen */}
      <div className="summary-grid">
        <Link to="/ingresos" className="summary-card income">
          <span className="card-pill">↑ Ingresos</span>
          <div className="card-label">Total este mes</div>
          <div className="card-value mono">{formatCOP(ingresos)}</div>
          <div className="card-cta">Ver ingresos →</div>
          <div className="card-decor" />
        </Link>

        <Link to="/gastos" className="summary-card expense">
          <span className="card-pill">↓ Gastos</span>
          <div className="card-label">Total este mes</div>
          <div className="card-value mono">{formatCOP(gastos)}</div>
          <div className="card-cta">Ver gastos →</div>
          <div className="card-decor" />
        </Link>

        <Link to="/metas" className="summary-card savings">
          <span className="card-pill">💰 Balance</span>
          <div className="card-label">Disponible para ahorro</div>
          <div className="card-value mono">{formatCOP(balance)}</div>
          <div className="card-cta">Ver metas →</div>
          <div className="card-decor" />
        </Link>
      </div>

      {/* Gráficas */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-title">Ingresos vs Gastos (últimos meses)</div>
          <div style={{ height: 260 }}>
            {monthly.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="empty">
                <div className="empty-icon">📊</div>
                Aún no hay datos suficientes para mostrar la gráfica.
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Gastos por categoría</div>
          {byCat.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📂</div>
              Sin gastos registrados este mes.
            </div>
          ) : (
            byCat.map((c) => {
              const meta = getCat(c.categoria);
              const pct = totalGastosCat > 0
                ? Math.round((c.total / totalGastosCat) * 100)
                : 0;
              return (
                <div className="cat-bar" key={c.categoria}>
                  <div className="cat-bar-header">
                    <span className="cat-bar-name">
                      {meta.icon} {c.categoria}
                    </span>
                    <span className="cat-bar-pct mono">
                      {formatCOP(c.total)} · {pct}%
                    </span>
                  </div>
                  <div className="cat-bar-track">
                    <div
                      className="cat-bar-fill"
                      style={{ width: `${pct}%`, background: meta.color }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Últimas transacciones */}
      <div className="section-header">
        <div className="section-title">Movimientos recientes</div>
        <Link to="/gastos" className="btn-sm-action">Ver todo</Link>
      </div>

      <div className="tx-list">
        {recent.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📝</div>
            Aún no has registrado movimientos.
          </div>
        ) : (
          recent.map((tx) => {
            const meta = getCat(tx.categoria);
            const isIncome = tx.tipo === 'ingreso';
            return (
              <div className="tx-item" key={tx.id}>
                <div className={`tx-icon ${meta.cls}`}>{meta.icon}</div>
                <div className="tx-info">
                  <div className="tx-desc">{tx.descripcion}</div>
                  <div className="tx-meta">
                    {tx.categoria} · {formatDate(tx.fecha)}
                  </div>
                </div>
                <div className={`tx-amount mono ${isIncome ? 'pos' : 'neg'}`}>
                  {isIncome ? '+' : '-'} {formatCOP(tx.monto)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
