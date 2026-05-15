import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth';

/**
 * AuthContext — fuente única de verdad para la sesión del usuario.
 * - Persiste el token y el usuario en localStorage
 * - Refresca el usuario llamando a /auth/me al montar si hay token
 * - Expone login(), register(), logout()
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('tp_token'));
  const [loading, setLoading] = useState(true);

  // Al montar, si hay token intenta validar la sesión contra el backend
  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('tp_token');
      const savedUser = localStorage.getItem('tp_user');

      if (savedToken && savedUser) {
        // Optimistic: rellena con lo guardado para que la UI no parpadee
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        try {
          const fresh = await authApi.me();
          setUser(fresh);
          localStorage.setItem('tp_user', JSON.stringify(fresh));
        } catch {
          // El interceptor 401 limpiará localStorage si era inválido
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('tp_token', data.access_token);
    localStorage.setItem('tp_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ nombre, email, password }) => {
    await authApi.register({ nombre, email, password });
    // Tras registro, hacemos login automático
    return login({ email, password });
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('tp_token');
    localStorage.removeItem('tp_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
