/**
 * Registro del service worker de la PWA.
 *
 * Solo se registra en producción (build) para no interferir con el
 * hot-reload ni causar problemas de caché durante el desarrollo (npm start).
 */

export function register() {
  if (process.env.NODE_ENV !== 'production') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((reg) => {
        // Si hay una versión nueva del SW esperando, se activará al recargar.
        reg.onupdatefound = () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.onstatechange = () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('TuPresupuesto: hay una actualización disponible.');
            }
          };
        };
      })
      .catch((err) => console.warn('Service worker no registrado:', err));
  });
}

export function unregister() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((reg) => reg.unregister())
    .catch(() => {});
}
