import { evaluatePassword } from '../utils/password';

/**
 * Indicador visual de fuerza de contraseña: barra de progreso + checklist
 * de requisitos que se marcan en vivo. Reutilizable en Registro y en el
 * cambio de contraseña del Perfil.
 *
 * Props:
 *   password  — la contraseña actual a evaluar
 *   show      — si false, no renderiza nada (útil cuando el campo está vacío)
 */
export default function PasswordStrength({ password = '', show = true }) {
  if (!show || !password) return null;

  const { results, score, level, color } = evaluatePassword(password);

  return (
    <div className="pwd-strength" aria-live="polite">
      <div className="pwd-bar-track">
        <div
          className="pwd-bar-fill"
          style={{ width: `${Math.max(8, score * 100)}%`, background: color }}
        />
      </div>
      <div className="pwd-level" style={{ color }}>
        Seguridad: {level}
      </div>

      <ul className="pwd-rules">
        {results.map((r) => (
          <li key={r.id} className={r.ok ? 'ok' : ''}>
            <span className="pwd-rule-icon">{r.ok ? '✓' : '○'}</span>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
