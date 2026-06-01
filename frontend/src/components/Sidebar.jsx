import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoBlanco from '../assets/logo-blanco.png';

const NAV_PRINCIPAL = [
  { to: '/dashboard',   icon: '🏠', label: 'Dashboard' },
  { to: '/ingresos',    icon: '💵', label: 'Ingresos' },
  { to: '/gastos',      icon: '💸', label: 'Gastos' },
  { to: '/metas',       icon: '🎯', label: 'Metas de Ahorro' },
  { to: '/presupuesto', icon: '📊', label: 'Presupuesto' },
  { to: '/reportes',    icon: '📈', label: 'Reportes' },
];

const NAV_CUENTA = [
  { to: '/perfil',        icon: '👤', label: 'Perfil' },
  { to: '/configuracion', icon: '⚙️', label: 'Configuración' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const initial = (user?.nombre || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = user?.nombre || user?.email || 'Usuario';

  const renderItem = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
    >
      <span className="nav-icon">{item.icon}</span>
      {item.label}
    </NavLink>
  );

  return (
    <nav className="nav">
      <div className="nav-logo">
        <img src={logoBlanco} alt="TuPresupuesto" className="nav-logo-img" />
      </div>

      <div className="nav-scroll">
        <div className="nav-label">Principal</div>
        {NAV_PRINCIPAL.map(renderItem)}

        <div className="nav-label nav-label-spaced">Cuenta</div>
        {NAV_CUENTA.map(renderItem)}
      </div>

      <div className="nav-footer">
        <NavLink to="/perfil" className="user-chip">
          <div className="user-avatar">{initial}</div>
          <div className="user-name">{displayName}</div>
        </NavLink>
        <button className="logout-btn" onClick={logout} type="button">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
