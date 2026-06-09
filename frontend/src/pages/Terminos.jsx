import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/legal.css';

/**
 * Página pública de Términos y Condiciones.
 * Requerida para Google Play Store y para informar al usuario sobre las
 * condiciones de uso, limitaciones de responsabilidad y propiedad
 * intelectual del servicio.
 *
 *   URL: /terminos
 */
export default function Terminos() {
  return (
    <div className="legal">
      <header className="legal-header">
        <div className="legal-container legal-nav">
          <Link to="/" className="legal-brand">
            <img src={logo} alt="TuPresupuesto" className="legal-logo" />
          </Link>
          <nav className="legal-nav-links">
            <Link to="/login" className="legal-nav-link">Iniciar sesión</Link>
            <Link to="/register" className="legal-btn">Crear cuenta</Link>
          </nav>
        </div>
      </header>

      <main className="legal-container legal-content">
        <div className="legal-breadcrumb">
          <Link to="/">Inicio</Link> <span>›</span> <span>Términos y Condiciones</span>
        </div>

        <h1>Términos y Condiciones de Uso</h1>
        <p className="legal-meta">
          <strong>Versión 1.0</strong> · Entrada en vigor: 2 de junio de 2026
        </p>

        <section>
          <h2>1. Aceptación de los términos</h2>
          <p>
            Bienvenido a TuPresupuesto. Al crear una cuenta y utilizar la aplicación, aceptas
            de manera expresa, libre, informada e inequívoca quedar sujeto a los presentes
            Términos y Condiciones, así como a nuestra{' '}
            <Link to="/privacidad">Política de Privacidad</Link>.
          </p>
          <p>
            Si no estás de acuerdo con alguno de los términos aquí descritos, por favor no
            uses el servicio.
          </p>
        </section>

        <section>
          <h2>2. Descripción del servicio</h2>
          <p>
            TuPresupuesto es una aplicación web progresiva (PWA) que permite al usuario
            gestionar sus finanzas personales mediante el registro manual de ingresos,
            gastos, metas de ahorro y presupuestos. La aplicación NO se conecta
            automáticamente con cuentas bancarias ni servicios financieros de terceros.
          </p>
        </section>

        <section>
          <h2>3. Registro y cuenta de usuario</h2>
          <ul>
            <li>Debes proporcionar información veraz, exacta y completa al registrarte.</li>
            <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
            <li>Eres responsable de toda actividad realizada bajo tu cuenta.</li>
            <li>Debes notificarnos inmediatamente cualquier uso no autorizado de tu cuenta.</li>
            <li>Solo se permite una cuenta por persona. Cuentas duplicadas o falsas pueden ser eliminadas.</li>
            <li>Debes ser mayor de edad (18 años o más). Los menores requieren autorización parental.</li>
          </ul>
        </section>

        <section>
          <h2>4. Uso aceptable</h2>
          <p>Al usar TuPresupuesto te comprometes a:</p>
          <ul>
            <li>No usar el servicio para fines ilegales o no autorizados.</li>
            <li>No intentar acceder sin autorización a cuentas, sistemas o redes asociadas al servicio.</li>
            <li>No introducir virus, malware o cualquier código malicioso.</li>
            <li>No realizar ingeniería inversa ni intentar descompilar el código de la aplicación.</li>
            <li>No usar bots, scrapers o cualquier sistema automatizado para extraer datos.</li>
            <li>No suplantar la identidad de otra persona u organización.</li>
            <li>No usar el servicio para acosar, amenazar o perjudicar a otros usuarios.</li>
          </ul>
          <p>
            El incumplimiento de estos términos puede resultar en la suspensión o eliminación
            de tu cuenta sin previo aviso.
          </p>
        </section>

        <section>
          <h2>5. Propiedad intelectual</h2>
          <p>
            Todos los derechos sobre la aplicación TuPresupuesto, incluyendo su código fuente,
            diseño, marca, logo, contenido y documentación, son propiedad exclusiva de la
            operadora del servicio y están protegidos por las leyes de propiedad intelectual
            colombianas e internacionales.
          </p>
          <p>
            Tus datos personales y financieros (movimientos, metas, categorías, presupuesto)
            siguen siendo de tu propiedad. Tú nos otorgas una licencia limitada para
            almacenarlos y procesarlos con el fin de prestarte el servicio.
          </p>
        </section>

        <section>
          <h2>6. Costo del servicio</h2>
          <p>
            TuPresupuesto se ofrece de manera <strong>completamente gratuita</strong> a los
            usuarios. No requerimos información de pago, no hay funcionalidades premium ni
            suscripciones. Nos reservamos el derecho de introducir, en el futuro, planes
            opcionales de pago para funcionalidades adicionales; en ese caso, lo
            comunicaremos con anticipación y las funcionalidades actuales seguirán siendo gratuitas.
          </p>
        </section>

        <section>
          <h2>7. Limitación de responsabilidad</h2>
          <p>
            TuPresupuesto es una herramienta de apoyo para la organización personal de tus
            finanzas. <strong>NO sustituye la asesoría profesional financiera, contable,
            tributaria o legal.</strong>
          </p>
          <ul>
            <li>No nos hacemos responsables de decisiones financieras tomadas con base en los reportes generados por la aplicación.</li>
            <li>El servicio se ofrece "TAL COMO ESTÁ", sin garantías de disponibilidad continua, ausencia de errores o adecuación a un propósito particular.</li>
            <li>No nos responsabilizamos por la pérdida de datos derivada del uso inadecuado de la cuenta, contraseña perdida o eliminación accidental.</li>
            <li>Aunque implementamos medidas razonables de seguridad, no podemos garantizar protección absoluta contra ataques cibernéticos.</li>
            <li>No nos responsabilizamos por interrupciones del servicio causadas por nuestros proveedores de infraestructura (Vercel, Firebase) o por causa de fuerza mayor.</li>
          </ul>
        </section>

        <section>
          <h2>8. Modificaciones al servicio</h2>
          <p>
            Nos reservamos el derecho de modificar, suspender o discontinuar cualquier
            funcionalidad del servicio en cualquier momento, con o sin notificación previa.
            Te notificaremos con anticipación razonable cuando se trate de cambios sustanciales.
          </p>
        </section>

        <section>
          <h2>9. Terminación de la cuenta</h2>
          <p><strong>Por parte del usuario:</strong> Puedes eliminar tu cuenta en cualquier momento desde Perfil → Eliminar cuenta. La eliminación es inmediata e irreversible.</p>
          <p><strong>Por parte del operador:</strong> Podemos suspender o eliminar cuentas que violen estos términos, sin previo aviso. En estos casos, te notificaremos por correo al email registrado.</p>
        </section>

        <section>
          <h2>10. Privacidad y datos personales</h2>
          <p>
            El tratamiento de tus datos personales se rige por nuestra{' '}
            <Link to="/privacidad">Política de Privacidad</Link>, que forma parte integral
            de estos Términos.
          </p>
        </section>

        <section>
          <h2>11. Notificaciones y comunicaciones</h2>
          <p>
            Las comunicaciones relacionadas con tu cuenta (cambios de contraseña, alertas
            de seguridad, actualizaciones legales) se enviarán al correo registrado. Es
            tu responsabilidad mantener actualizada tu dirección de email.
          </p>
        </section>

        <section>
          <h2>12. Modificaciones a estos términos</h2>
          <p>
            Podemos actualizar estos Términos y Condiciones. Cuando hagamos cambios
            sustanciales, te notificaremos en la aplicación al iniciar sesión, con al menos
            30 días de anticipación. Si no estás de acuerdo con los cambios, podrás
            eliminar tu cuenta sin penalización antes de la fecha de entrada en vigor.
          </p>
        </section>

        <section>
          <h2>13. Ley aplicable y jurisdicción</h2>
          <p>
            Estos Términos se rigen por las leyes de la República de Colombia. Cualquier
            controversia será resuelta ante los jueces y tribunales competentes de
            Bogotá D.C., renunciando expresamente a cualquier otro fuero que pudiera
            corresponder.
          </p>
        </section>

        <section>
          <h2>14. Disposiciones finales</h2>
          <ul>
            <li><strong>Divisibilidad:</strong> Si una cláusula es declarada inválida, las demás mantienen vigencia.</li>
            <li><strong>No renuncia:</strong> Que no ejerzamos un derecho en una ocasión no implica renuncia futura.</li>
            <li><strong>Acuerdo completo:</strong> Estos Términos, junto con la Política de Privacidad, constituyen el acuerdo completo entre el usuario y el operador del servicio.</li>
          </ul>
        </section>

        <section>
          <h2>15. Contacto</h2>
          <div className="legal-card">
            <div><strong>Correo:</strong> hola@tupresupuesto.app</div>
            <div><strong>Operadora:</strong> Geraldine Rios</div>
            <div><strong>Ubicación:</strong> Bogotá D.C., Colombia</div>
          </div>
        </section>

        <div className="legal-footer-note">
          <p>
            Al usar TuPresupuesto declaras haber leído, entendido y aceptado expresamente
            estos Términos y Condiciones.
          </p>
          <p>
            <Link to="/privacidad">Ver Política de Privacidad</Link>
          </p>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="legal-container">
          <span>© 2026 TuPresupuesto · <Link to="/">Volver al inicio</Link></span>
        </div>
      </footer>
    </div>
  );
}
