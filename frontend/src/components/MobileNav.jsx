import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Inicio' },
  { to: '/gastos',    icon: '💸', label: 'Gastos' },
  { to: '/reportes',  icon: '📈', label: 'Reportes' },
  { to: '/metas',     icon: '🎯', label: 'Ahorro' },
  { to: '/perfil',    icon: '👤', label: 'Perfil' },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      {ITEMS.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) =>
            isActive ? 'mobile-nav-item active' : 'mobile-nav-item'
          }
        >
          <span className="mn-icon">{it.icon}</span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
