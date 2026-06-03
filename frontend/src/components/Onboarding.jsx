import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/onboarding.css';

/**
 * Onboarding interactivo (tour de bienvenida)
 *
 * Se muestra UNA SOLA VEZ por usuario, la primera vez que entra al área
 * privada después de registrarse o iniciar sesión. Persiste un flag en
 * localStorage por id de usuario para no volver a mostrarse.
 *
 *   key: `tp_onboarding_done_${user.id}`
 *
 * El usuario puede:
 *   - Avanzar con "Siguiente"
 *   - Retroceder con "Atrás"
 *   - Saltar con la X (también marca como completado)
 *   - Volver a verlo desde Perfil → "Mostrar tutorial otra vez"
 *     (eso se implementa en Perfil.jsx limpiando la key del localStorage).
 */

const STEPS = [
  {
    icon: '👋',
    title: '¡Bienvenido a TuPresupuesto!',
    body: 'Te haremos un recorrido rápido por las cinco zonas principales de la app. Tomará menos de un minuto.',
    color: 'var(--navy)',
  },
  {
    icon: '🏠',
    title: 'Tu Dashboard',
    body: 'Aquí ves el resumen del mes en curso: ingresos, gastos, saldo, movimientos recientes y un desglose por categoría. Es la primera pantalla cada vez que entres.',
    color: 'var(--ocean)',
  },
  {
    icon: '💵',
    title: 'Registra ingresos y gastos',
    body: 'Desde el menú "Ingresos" y "Gastos" puedes capturar tus movimientos con descripción, categoría, monto, fecha y nota. Edítalos o elimínalos cuando quieras.',
    color: 'var(--mint)',
  },
  {
    icon: '🎯',
    title: 'Define metas de ahorro',
    body: 'Crea metas con un monto objetivo y fecha límite. Aporta poco a poco con "Aportar" o ajusta el acumulado manualmente. Verás el avance porcentual en cada tarjeta.',
    color: 'var(--teal)',
  },
  {
    icon: '📊',
    title: 'Planifica tu presupuesto',
    body: 'En "Presupuesto" estableces un límite mensual por categoría. La app calcula en vivo cuánto llevas gastado y te alerta visualmente cuando estás cerca o excedes el tope.',
    color: 'var(--amber)',
  },
  {
    icon: '📈',
    title: 'Mide tu progreso',
    body: 'En "Reportes" puedes ver tu evolución histórica, comparar mes vs. mes anterior y entender en qué categorías está creciendo tu gasto.',
    color: 'var(--violet)',
  },
  {
    icon: '🚀',
    title: '¡Todo listo!',
    body: 'Empieza registrando tu primer ingreso o gasto. Puedes volver a ver este tutorial cuando quieras desde tu Perfil.',
    color: 'var(--mint)',
  },
];

export default function Onboarding() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  // Decidir si mostrar el tour al montar
  useEffect(() => {
    if (!user || !user.id) return;
    const key = `tp_onboarding_done_${user.id}`;
    const done = localStorage.getItem(key);
    if (!done) setVisible(true);
  }, [user]);

  // Cerrar con ESC
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => { if (e.key === 'Escape') handleSkip(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const markDone = () => {
    if (user?.id) {
      localStorage.setItem(`tp_onboarding_done_${user.id}`, '1');
    }
    setVisible(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else markDone();
  };
  const handleBack = () => { if (step > 0) setStep(step - 1); };
  const handleSkip = () => markDone();

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div
      className="ob-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ob-title"
      aria-describedby="ob-body"
    >
      <div className="ob-modal">
        {/* Botón cerrar */}
        <button
          type="button"
          className="ob-close"
          onClick={handleSkip}
          aria-label="Saltar tutorial"
        >
          ×
        </button>

        {/* Ícono grande arriba */}
        <div className="ob-icon" style={{ background: current.color }}>
          <span>{current.icon}</span>
        </div>

        {/* Contenido */}
        <h2 id="ob-title" className="ob-title">{current.title}</h2>
        <p id="ob-body" className="ob-body">{current.body}</p>

        {/* Indicador de progreso (puntos) */}
        <div className="ob-dots" role="tablist" aria-label="Progreso del tutorial">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={'ob-dot' + (i === step ? ' active' : '') + (i < step ? ' done' : '')}
              onClick={() => setStep(i)}
              aria-label={`Ir al paso ${i + 1} de ${STEPS.length}`}
              aria-current={i === step ? 'step' : undefined}
            />
          ))}
        </div>

        {/* Pie con botones */}
        <div className="ob-actions">
          <button
            type="button"
            className="ob-btn ob-btn-ghost"
            onClick={handleSkip}
          >
            Saltar tutorial
          </button>

          <div className="ob-actions-right">
            {!isFirst && (
              <button
                type="button"
                className="ob-btn ob-btn-outline"
                onClick={handleBack}
              >
                Atrás
              </button>
            )}
            <button
              type="button"
              className="ob-btn ob-btn-primary"
              onClick={handleNext}
              autoFocus
            >
              {isLast ? '¡Empezar!' : 'Siguiente'}
            </button>
          </div>
        </div>

        {/* Contador discreto debajo */}
        <div className="ob-counter">Paso {step + 1} de {STEPS.length}</div>
      </div>
    </div>
  );
}
