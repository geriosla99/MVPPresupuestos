/**
 * Recordatorios mediante la API de notificaciones del navegador.
 *
 * Estrategia (sin backend extra): cuando el usuario activa los recordatorios,
 * se pide permiso al navegador y se guarda la preferencia en localStorage.
 * Al abrir la app, si han pasado >= `días` sin registrar movimientos y hoy aún
 * no se notificó, se lanza una notificación local.
 */

const PREF_KEY = 'tp_reminders';        // { enabled, days }
const LAST_NOTIFIED_KEY = 'tp_last_notified';   // 'YYYY-MM-DD'

export const notificationsSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export function getReminderPrefs() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { enabled: false, days: 2 };
}

export function saveReminderPrefs(prefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

/** Solicita permiso de notificaciones. Devuelve el estado final ('granted', 'denied', 'default'). */
export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/** Lanza una notificación inmediata (usado por el botón "probar"). */
export function sendNotification(title, body) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false;
  try {
    new Notification(title, {
      body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'tupresupuesto-recordatorio',
    });
    return true;
  } catch {
    return false;
  }
}

const todayStr = () => new Date().toISOString().slice(0, 10);

/**
 * Evalúa si corresponde recordar y, de ser así, lanza la notificación.
 * @param {string|null} lastMovementDate  fecha 'YYYY-MM-DD' del último movimiento
 */
export function maybeRemind(lastMovementDate) {
  const prefs = getReminderPrefs();
  if (!prefs.enabled) return;
  if (!notificationsSupported() || Notification.permission !== 'granted') return;

  const today = todayStr();
  if (localStorage.getItem(LAST_NOTIFIED_KEY) === today) return; // ya se avisó hoy

  let diasSin = Infinity;
  if (lastMovementDate) {
    const last = new Date(lastMovementDate);
    diasSin = Math.floor((Date.now() - last.getTime()) / 86400000);
  }

  if (diasSin >= (prefs.days || 2)) {
    const ok = sendNotification(
      '💰 TuPresupuesto',
      'No olvides registrar tus movimientos financieros de hoy.'
    );
    if (ok) localStorage.setItem(LAST_NOTIFIED_KEY, today);
  }
}
