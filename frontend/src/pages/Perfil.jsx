import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import PasswordStrength from '../components/PasswordStrength';
import PasswordInput from '../components/PasswordInput';
import { evaluatePassword } from '../utils/password';
import {
  getReminderPrefs,
  saveReminderPrefs,
  requestNotificationPermission,
  sendNotification,
  notificationsSupported,
} from '../utils/notifications';

/**
 * Perfil — datos de la cuenta, cambio de contraseña, recordatorios por
 * notificación del navegador y eliminación de cuenta.
 */
export default function Perfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ─── Cambio de contraseña ───
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState(null);   // { type: 'ok'|'error', text }
  const [pwdBusy, setPwdBusy] = useState(false);

  const handlePwdChange = (e) => setPwd({ ...pwd, [e.target.name]: e.target.value });

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);

    if (!pwd.current_password || !pwd.new_password) {
      setPwdMsg({ type: 'error', text: 'Completa todos los campos.' });
      return;
    }
    if (!evaluatePassword(pwd.new_password).allPassed) {
      setPwdMsg({ type: 'error', text: 'La nueva contraseña no cumple los requisitos.' });
      return;
    }
    if (pwd.new_password !== pwd.confirm) {
      setPwdMsg({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' });
      return;
    }

    setPwdBusy(true);
    try {
      await authApi.changePassword({
        current_password: pwd.current_password,
        new_password: pwd.new_password,
      });
      setPwdMsg({ type: 'ok', text: 'Contraseña actualizada correctamente.' });
      setPwd({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwdMsg({
        type: 'error',
        text: err.response?.data?.detail || 'No pudimos cambiar la contraseña.',
      });
    } finally {
      setPwdBusy(false);
    }
  };

  // ─── Recordatorios (notificaciones del navegador) ───
  const [reminders, setReminders] = useState(getReminderPrefs());
  const [permState, setPermState] = useState(
    notificationsSupported() ? Notification.permission : 'unsupported'
  );
  const [remMsg, setRemMsg] = useState(null);

  const toggleReminders = async () => {
    if (!reminders.enabled) {
      const perm = await requestNotificationPermission();
      setPermState(perm);
      if (perm !== 'granted') {
        setRemMsg({
          type: 'error',
          text: 'Tu navegador bloqueó las notificaciones. Actívalas desde la configuración del navegador.',
        });
        return;
      }
    }
    const next = { ...reminders, enabled: !reminders.enabled };
    setReminders(next);
    saveReminderPrefs(next);
    setRemMsg({
      type: 'ok',
      text: next.enabled ? 'Recordatorios activados.' : 'Recordatorios desactivados.',
    });
  };

  const changeDays = (e) => {
    const next = { ...reminders, days: Number(e.target.value) };
    setReminders(next);
    saveReminderPrefs(next);
  };

  const testNotification = () => {
    const ok = sendNotification(
      '💰 TuPresupuesto',
      'Así se verá tu recordatorio para anotar movimientos.'
    );
    if (!ok) {
      setRemMsg({ type: 'error', text: 'Activa primero los recordatorios para probar.' });
    }
  };

  // ─── Eliminar cuenta ───
  const [confirmText, setConfirmText] = useState('');
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState(null);

  const deleteAccount = async () => {
    if (confirmText !== 'ELIMINAR') return;
    setDelBusy(true);
    setDelErr(null);
    try {
      await authApi.deleteAccount();
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setDelErr(err.response?.data?.detail || 'No pudimos eliminar la cuenta.');
      setDelBusy(false);
    }
  };

  const initial = (user?.nombre || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="stack-lg">
      {/* Identidad */}
      <div className="form-card">
        <div className="profile-head">
          <div className="profile-avatar">{initial}</div>
          <div>
            <div className="profile-name">{user?.nombre || 'Usuario'}</div>
            <div className="profile-email">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <form className="form-card" onSubmit={submitPassword}>
        <h3>🔒 Cambiar contraseña</h3>

        {pwdMsg && (
          <div className={`alert-banner ${pwdMsg.type === 'error' ? 'danger' : ''}`}>
            {pwdMsg.type === 'error' ? '⚠️' : '✅'} {pwdMsg.text}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="current_password">Contraseña actual</label>
          <PasswordInput
            id="current_password"
            name="current_password"
            autoComplete="current-password"
            value={pwd.current_password}
            onChange={handlePwdChange}
            disabled={pwdBusy}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="new_password">Nueva contraseña</label>
            <PasswordInput
              id="new_password"
              name="new_password"
              autoComplete="new-password"
              value={pwd.new_password}
              onChange={handlePwdChange}
              disabled={pwdBusy}
            />
            <PasswordStrength password={pwd.new_password} />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirmar nueva contraseña</label>
            <PasswordInput
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              value={pwd.confirm}
              onChange={handlePwdChange}
              disabled={pwdBusy}
            />
            {pwd.confirm && pwd.new_password !== pwd.confirm && (
              <span className="field-hint error">Las contraseñas no coinciden.</span>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={pwdBusy}>
            {pwdBusy ? 'Guardando…' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>

      {/* Recordatorios */}
      <div className="form-card">
        <h3>🔔 Recordatorios</h3>
        <p className="card-help">
          Recibe una notificación del navegador cuando lleves días sin registrar
          tus movimientos financieros.
        </p>

        {remMsg && (
          <div className={`alert-banner ${remMsg.type === 'error' ? 'danger' : ''}`}>
            {remMsg.type === 'error' ? '⚠️' : '✅'} {remMsg.text}
          </div>
        )}

        {permState === 'unsupported' ? (
          <div className="alert-banner danger">
            ⚠️ Tu navegador no soporta notificaciones.
          </div>
        ) : (
          <>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Activar recordatorios</div>
                <div className="toggle-desc">
                  Pediremos permiso de notificaciones a tu navegador.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={reminders.enabled}
                className={`switch ${reminders.enabled ? 'on' : ''}`}
                onClick={toggleReminders}
              >
                <span className="switch-knob" />
              </button>
            </div>

            <div className="form-row" style={{ marginTop: 12 }}>
              <div className="form-group">
                <label htmlFor="rem-days">Recordarme si pasan</label>
                <select
                  id="rem-days"
                  value={reminders.days}
                  onChange={changeDays}
                  disabled={!reminders.enabled}
                >
                  <option value={1}>1 día sin registrar</option>
                  <option value={2}>2 días sin registrar</option>
                  <option value={3}>3 días sin registrar</option>
                  <option value={7}>1 semana sin registrar</option>
                </select>
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={testNotification}
                >
                  Probar notificación
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Eliminar cuenta */}
      <div className="form-card danger-zone">
        <h3>🗑 Eliminar cuenta</h3>
        <p className="card-help">
          Esta acción es permanente. Se borrarán tu cuenta y todos tus datos:
          transacciones, metas, presupuesto y categorías. No se puede deshacer.
        </p>

        {delErr && <div className="alert-banner danger">⚠️ {delErr}</div>}

        <div className="form-group">
          <label htmlFor="confirm-del">
            Escribe <strong>ELIMINAR</strong> para confirmar
          </label>
          <input
            id="confirm-del"
            type="text"
            placeholder="ELIMINAR"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={delBusy}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-danger"
            onClick={deleteAccount}
            disabled={confirmText !== 'ELIMINAR' || delBusy}
          >
            {delBusy ? 'Eliminando…' : 'Eliminar mi cuenta definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );
}
