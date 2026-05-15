import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';

/**
 * Layout principal de la aplicación autenticada.
 * Sidebar fija a la izquierda, Topbar arriba, contenido en <Outlet/>,
 * y un MobileNav inferior solo en pantallas pequeñas.
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
    </div>
  );
}
