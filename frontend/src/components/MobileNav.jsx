import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/ingresos',  icon: '💵', label: 'Ingresos' },
  { to: '/gastos',    icon: '💸', label: 'Gastos' },
  { to: '/metas',     icon: '🎯', label: 'Ahorro' },
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
