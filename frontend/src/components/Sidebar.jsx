import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: '🏠', label: 'Dashboard' },
  { to: '/ingresos',      icon: '💵', label: 'Ingresos' },
  { to: '/gastos',        icon: '💸', label: 'Gastos' },
  { to: '/metas',         icon: '🎯', label: 'Metas de Ahorro' },
  { to: '/presupuesto',   icon: '📊', label: 'Presupuesto' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const initial = (user?.nombre || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = user?.nombre || user?.email || 'Usuario';

  return (
    <nav className="nav">
      <div className="nav-logo">
        <div className="nav-logo-icon">💰</div>
        <div className="nav-logo-text">Tu<span>Presupuesto</span></div>
      </div>

      <div className="nav-label">Principal</div>

      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      <div className="nav-footer">
        <div className="user-chip">
          <div className="user-avatar">{initial}</div>
          <div className="user-name">{displayName}</div>
        </div>
        <button className="logout-btn" onClick={logout} type="button">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
