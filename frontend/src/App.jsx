import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Ingresos from './pages/Ingresos';
import Gastos from './pages/Gastos';
import Metas from './pages/Metas';
import Presupuesto from './pages/Presupuesto';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import Perfil from './pages/Perfil';

/**
 * Mapa de rutas:
 *   /                      → Landing pública (si hay sesión, ella misma redirige a /dashboard)
 *   /login, /register      → públicas
 *   /dashboard, /ingresos, /gastos, /metas, /presupuesto, /reportes,
 *   /configuracion, /perfil → privadas (AppLayout)
 *   *                      → fallback → Landing pública
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública — landing en raíz */}
          <Route path="/" element={<Landing />} />

          {/* Públicas — autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Privadas con layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ingresos" element={<Ingresos />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/presupuesto" element={<Presupuesto />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
