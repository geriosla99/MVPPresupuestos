import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/legal.css';

/**
 * Página pública de Política de Privacidad.
 * Replica el contenido de politica_privacidad_tupresupuesto.docx para
 * cumplir con el requisito de Google Play Store de tener una URL pública
 * de política de privacidad accesible.
 *
 *   URL: /privacidad
 */
export default function Privacidad() {
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
          <Link to="/">Inicio</Link> <span>›</span> <span>Política de privacidad</span>
        </div>

        <h1>Política de Privacidad y Tratamiento de Datos Personales</h1>
        <p className="legal-meta">
          <strong>Versión 1.0</strong> · Entrada en vigor: 2 de junio de 2026 · Última actualización: 2 de junio de 2026
        </p>

        <section>
          <h2>1. Introducción y responsable del tratamiento</h2>
          <p>
            TuPresupuesto ("la aplicación", "el servicio") es una aplicación web progresiva (PWA)
            que ayuda a sus usuarios a gestionar sus finanzas personales: registrar ingresos y
            gastos, definir presupuestos mensuales y fijar metas de ahorro.
          </p>
          <p>
            Esta política se rige por la Ley 1581 de 2012 de Colombia, el Decreto 1377 de 2013,
            y cuando aplique a usuarios europeos, por el Reglamento General de Protección de
            Datos (GDPR).
          </p>
          <div className="legal-card">
            <div><strong>Responsable:</strong> TuPresupuesto (operadora: Geraldine Rios)</div>
            <div><strong>Ubicación:</strong> Bogotá D.C., Colombia</div>
            <div><strong>Contacto general:</strong> hola@tupresupuesto.app</div>
            <div><strong>Privacidad:</strong> privacidad@tupresupuesto.app</div>
          </div>
        </section>

        <section>
          <h2>2. Información personal que recopilamos</h2>
          <h3>2.1 Datos de cuenta</h3>
          <ul>
            <li>Nombre completo (para personalizar tu experiencia)</li>
            <li>Correo electrónico (identificador único de la cuenta)</li>
            <li>Contraseña (cifrada con bcrypt 12 rondas, nunca en texto plano)</li>
            <li>Fecha de creación de la cuenta</li>
          </ul>
          <h3>2.2 Datos financieros que registras</h3>
          <ul>
            <li>Transacciones: descripción, categoría, monto, fecha, notas</li>
            <li>Metas de ahorro: nombre, monto objetivo, monto acumulado, fecha límite</li>
            <li>Presupuesto: límite por categoría y mes</li>
            <li>Categorías personalizadas: nombre e ícono</li>
          </ul>
          <h3>2.3 Datos técnicos automáticos</h3>
          <ul>
            <li>Dirección IP (logs de seguridad, máximo 30 días)</li>
            <li>Tipo de navegador y sistema operativo</li>
            <li>Identificador de sesión (JWT, expira a los 60 minutos)</li>
          </ul>
          <h3>2.4 Datos que NO recopilamos</h3>
          <ul>
            <li>Información bancaria real (no conectamos con tus cuentas)</li>
            <li>Tarjetas de crédito o débito</li>
            <li>Ubicación GPS, contactos, fotos, micrófono o cámara</li>
            <li>Cookies de terceros con fines publicitarios</li>
          </ul>
        </section>

        <section>
          <h2>3. Finalidad del tratamiento</h2>
          <ul>
            <li>Permitirte crear, autenticar y gestionar tu cuenta</li>
            <li>Almacenar y mostrar tu información financiera personal</li>
            <li>Calcular resúmenes, gráficos, reportes y alertas</li>
            <li>Enviarte notificaciones operativas de tu cuenta</li>
            <li>Garantizar la seguridad del servicio</li>
            <li>Cumplir con obligaciones legales</li>
          </ul>
          <p>
            <strong>No usamos tus datos para publicidad, perfilamiento comercial, venta a
            terceros, ni para entrenar modelos de inteligencia artificial.</strong>
          </p>
        </section>

        <section>
          <h2>4. Compartir información con terceros</h2>
          <p>
            Nos apoyamos en proveedores tecnológicos confiables que actúan como Encargados del
            Tratamiento bajo contratos que garantizan protección equivalente:
          </p>
          <ul>
            <li><strong>Google Firebase / Firestore:</strong> base de datos NoSQL (Estados Unidos, certificación SOC 2 / ISO 27001)</li>
            <li><strong>Vercel Inc.:</strong> hospedaje del frontend y API serverless (Estados Unidos)</li>
            <li><strong>Google Cloud Platform:</strong> infraestructura subyacente de Firebase</li>
          </ul>
          <p><strong>NO compartimos con:</strong> empresas de publicidad, brokers de datos, redes sociales, ni buros de crédito.</p>
        </section>

        <section>
          <h2>5. Derechos del titular del dato</h2>
          <p>
            Para ejercer tus derechos, escribe a{' '}
            <a href="mailto:privacidad@tupresupuesto.app">privacidad@tupresupuesto.app</a>.
            Te respondemos en máximo 10 días hábiles (consultas) o 15 días hábiles (reclamos).
          </p>
          <h3>Derechos ARCO</h3>
          <ul>
            <li><strong>Acceso:</strong> conocer qué datos conservamos sobre ti</li>
            <li><strong>Rectificación:</strong> corregir información inexacta</li>
            <li><strong>Cancelación:</strong> eliminar tus datos (directamente desde Perfil → Eliminar cuenta)</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento si consideras incumplimiento</li>
          </ul>
          <h3>Cómo eliminar tu cuenta</h3>
          <p>
            Inicia sesión → <strong>Perfil → Eliminar cuenta</strong>. Confirma con tu contraseña y
            se borrará en cascada toda tu información: transacciones, metas, presupuesto y categorías.
            El proceso es inmediato e irreversible.
          </p>
        </section>

        <section>
          <h2>6. Tiempo de conservación</h2>
          <ul>
            <li><strong>Datos de cuenta:</strong> mientras la cuenta esté activa. Al eliminar, se borran inmediatamente.</li>
            <li><strong>Logs de seguridad:</strong> máximo 30 días.</li>
            <li><strong>Backups operativos:</strong> hasta 30 días tras eliminación.</li>
          </ul>
        </section>

        <section>
          <h2>7. Medidas de seguridad</h2>
          <ul>
            <li>Cifrado HTTPS/TLS 1.3 en todas las comunicaciones</li>
            <li>Contraseñas con bcrypt (12 rondas, salt único por usuario)</li>
            <li>Autenticación con JWT firmado HS256, expiración 60 min</li>
            <li>Aislamiento estricto por usuario en la base de datos</li>
            <li>Reglas de seguridad de Firestore que bloquean acceso directo</li>
            <li>Validación de payloads con Pydantic</li>
            <li>CORS configurado para orígenes verificados</li>
            <li>Monitoreo de logs y accesos sospechosos</li>
          </ul>
          <p>
            En caso de brecha de seguridad que afecte tus datos, te notificaremos al correo de
            tu cuenta y a la Superintendencia de Industria y Comercio en máximo 72 horas.
          </p>
        </section>

        <section>
          <h2>8. Cookies y tecnologías similares</h2>
          <ul>
            <li><strong>localStorage:</strong> para mantener tu sesión y guardar preferencias</li>
            <li><strong>Service Worker:</strong> para PWA y funcionamiento offline parcial</li>
          </ul>
          <p>
            <strong>No utilizamos cookies de seguimiento, publicitarias ni píxeles de terceros.</strong>
          </p>
        </section>

        <section>
          <h2>9. Menores de edad</h2>
          <p>
            TuPresupuesto está dirigida a usuarios mayores de edad (18+). Si eres menor de
            edad, requerirás autorización expresa de tus padres o representantes legales.
            Las cuentas de menores de 14 años se eliminarán al detectarse.
          </p>
        </section>

        <section>
          <h2>10. Cambios a esta política</h2>
          <p>
            Cuando hagamos cambios sustanciales te notificaremos en la aplicación con al menos
            30 días de anticipación. Publicaremos la nueva versión en esta misma URL con la
            fecha de entrada en vigor.
          </p>
        </section>

        <section>
          <h2>11. Contacto y reclamaciones</h2>
          <div className="legal-card">
            <div><strong>Correo general:</strong> hola@tupresupuesto.app</div>
            <div><strong>Privacidad:</strong> privacidad@tupresupuesto.app</div>
            <div><strong>Tiempo de respuesta:</strong> 10 días hábiles (consultas), 15 días hábiles (reclamos)</div>
          </div>
          <h3>Autoridad de protección de datos</h3>
          <p>
            Si consideras que no atendemos adecuadamente tu solicitud, puedes presentar queja ante:
          </p>
          <div className="legal-card">
            <div><strong>Superintendencia de Industria y Comercio (SIC)</strong></div>
            <div>Carrera 13 No. 27-00 piso 5, Bogotá D.C.</div>
            <div>Teléfono: (601) 587 0000</div>
            <div>Web: <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer">www.sic.gov.co</a></div>
          </div>
        </section>

        <div className="legal-footer-note">
          <p>
            Al registrarte y usar TuPresupuesto declaras haber leído, entendido y aceptado
            expresamente esta Política de Privacidad. Esta política se rige por las leyes
            de la República de Colombia.
          </p>
          <p>
            <Link to="/terminos">Ver Términos y Condiciones</Link>
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
