// Prayer time notifications support

const PRAYER_LABELS: Record<string, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function toMinutes(time24: string): number {
  const [h, m] = time24.split(':').map(Number);
  return h * 60 + m;
}

let scheduledTimers: ReturnType<typeof setTimeout>[] = [];

export function schedulePrayerNotifications(timings: Record<string, string>) {
  // Clear any existing timers
  scheduledTimers.forEach(t => clearTimeout(t));
  scheduledTimers = [];

  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const riyadhNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const nowMinutes = riyadhNow.getHours() * 60 + riyadhNow.getMinutes();
  const nowSeconds = riyadhNow.getSeconds();

  Object.entries(PRAYER_LABELS).forEach(([key, label]) => {
    const timeStr = timings[key]?.split(' ')[0];
    if (!timeStr) return;

    const prayerMinutes = toMinutes(timeStr);
    let diffMinutes = prayerMinutes - nowMinutes;

    if (diffMinutes <= 0) return; // Already passed

    const delayMs = (diffMinutes * 60 - nowSeconds) * 1000;

    const timer = setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('عِتْرَة', {
          body: `نداء السماء ينتظرك 🕌 (${label})`,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `prayer-${key}`,
        });
      }
    }, delayMs);

    scheduledTimers.push(timer);
  });
}
