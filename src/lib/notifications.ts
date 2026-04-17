// Local-only prayer notifications (no backend, no push subscriptions)
// v11: only Adhan/prayer reminders are supported, scheduled in the user's browser

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

interface PrayerTimings {
  Fajr?: string;
  Dhuhr?: string;
  Asr?: string;
  Maghrib?: string;
  Isha?: string;
  [k: string]: string | undefined;
}

const PRAYER_LABELS_AR: Record<string, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

const PRAYER_LABELS_EN: Record<string, string> = {
  Fajr: 'Fajr',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha',
};

const TIMERS: number[] = [];

export function clearScheduledNotifications() {
  while (TIMERS.length) {
    const id = TIMERS.pop();
    if (id !== undefined) clearTimeout(id);
  }
}

export function schedulePrayerNotifications(timings: PrayerTimings) {
  if (getNotificationPermission() !== 'granted') return;
  clearScheduledNotifications();

  const lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
  const labels = lang === 'en' ? PRAYER_LABELS_EN : PRAYER_LABELS_AR;
  const titlePrefix = lang === 'en' ? 'Prayer time: ' : 'حان وقت صلاة ';

  const enabled = localStorage.getItem('atraa_notif_adhan') === 'true';
  if (!enabled) return;

  const now = new Date();
  Object.keys(labels).forEach((key) => {
    const raw = timings[key];
    if (!raw) return;
    const [h, m] = raw.split(' ')[0].split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const delay = target.getTime() - now.getTime();
    if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return;
    const id = window.setTimeout(() => {
      try {
        new Notification(titlePrefix + labels[key], {
          body: lang === 'en' ? 'It is time to pray.' : 'حان الآن وقت الصلاة',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `prayer-${key}`,
        });
      } catch {
        /* ignore */
      }
    }, delay);
    TIMERS.push(id);
  });
}
