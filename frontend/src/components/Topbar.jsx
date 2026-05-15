import { useLocation, useNavigate } from 'react-router-dom';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/ingresos': 'Ingresos',
  '/gastos': 'Gastos',
  '/metas': 'Metas de Ahorro',
  '/presupuesto': 'Presupuesto',
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = TITLES[location.pathname] || 'TuPresupuesto';
  const showBack = location.pathname !== '/dashboard';

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      {showBack && (
        <button
          className="topbar-back"
          onClick={() => navigate('/dashboard')}
          type="button"
        >
          ← Volver al Dashboard
        </button>
      )}
    </div>
  );
}
