import { useState } from 'react';

/**
 * Input de contraseña con botón "mostrar/ocultar" (ojo).
 * Mantiene el contrato de un <input> nativo: acepta value, onChange, name, id,
 * placeholder, autoComplete, disabled, etc.
 *
 * Uso:
 *   <PasswordInput
 *     id="password"
 *     name="password"
 *     autoComplete="current-password"
 *     value={form.password}
 *     onChange={handleChange}
 *     disabled={submitting}
 *   />
 */
export default function PasswordInput({
  id,
  name = 'password',
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  disabled = false,
  className = '',
  ...rest
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={`pwd-input ${className}`}>
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        {...rest}
      />
      <button
        type="button"
        className="pwd-toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={show}
        tabIndex={-1}
      >
        {show ? '🙈' : '👁'}
      </button>
    </div>
  );
}
