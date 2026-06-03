import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import Onboarding from './Onboarding';

/**
 * Layout principal de la aplicación autenticada.
 * Sidebar fija a la izquierda, Topbar arriba, contenido en <Outlet/>,
 * y un MobileNav inferior solo en pantallas pequeñas.
 *
 * El componente <Onboarding /> se monta aquí (no dentro de Dashboard) para
 * que cubra TODA el área autenticada como overlay y se muestre la primera
 * vez que el usuario entra a cualquier ruta privada.
 */
export default function AppLayout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <main className="page page-fade">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <Onboarding />
    </div>
  );
}
