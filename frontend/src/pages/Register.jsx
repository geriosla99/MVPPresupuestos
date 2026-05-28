import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordStrength from '../components/PasswordStrength';
import PasswordInput from '../components/PasswordInput';
import { evaluatePassword } from '../utils/password';
import logo from '../assets/logo.png';
import '../styles/auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    password2: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre || !form.email || !form.password) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (!evaluatePassword(form.password).allPassed) {
      setError('La contraseña no cumple todos los requisitos de seguridad.');
      return;
    }
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'No pudimos crear tu cuenta. Intenta de nuevo.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card page-fade">
        <div className="auth-logo">
          <img src={logo} alt="TuPresupuesto" className="auth-logo-img" />
        </div>

        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-subtitle">Empieza a tomar el control de tu dinero hoy mismo.</p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              placeholder="Geraldine"
              value={form.nombre}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="Crea una contraseña segura"
              value={form.password}
              onChange={handleChange}
              disabled={submitting}
              aria-describedby="pwd-help"
            />
            <div id="pwd-help">
              <PasswordStrength password={form.password} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password2">Confirma la contraseña</label>
            <PasswordInput
              id="password2"
              name="password2"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={form.password2}
              onChange={handleChange}
              disabled={submitting}
            />
            {form.password2 && form.password !== form.password2 && (
              <span className="field-hint error">Las contraseñas no coinciden.</span>
            )}
          </div>

          <button className="auth-btn" type="submit" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-foot">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
