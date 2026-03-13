// Enhanced prayer time & app notifications

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

export function schedulePrayerNotifications(timings: Record<string, any>) {
  scheduledTimers.forEach(t => clearTimeout(t));
  scheduledTimers = [];

  if (Notification.permission !== 'granted') return;
  if (localStorage.getItem('atraa_notif_adhan') !== 'true') return;

  const now = new Date();
  const riyadhNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const nowMinutes = riyadhNow.getHours() * 60 + riyadhNow.getMinutes();
  const nowSeconds = riyadhNow.getSeconds();

  Object.entries(PRAYER_LABELS).forEach(([key, label]) => {
    const timeStr = timings[key]?.split(' ')[0];
    if (!timeStr) return;

    const prayerMinutes = toMinutes(timeStr);
    let diffMinutes = prayerMinutes - nowMinutes;
    if (diffMinutes <= 0) return;

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

// Schedule quiz notifications
export function scheduleQuizNotifications() {
  if (Notification.permission !== 'granted') return;
  if (localStorage.getItem('atraa_notif_quiz') !== 'true') return;

  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();

  // Before questions start at 9:00 AM — notify at 8:45 AM
  if (h < 8 || (h === 8 && m < 45)) {
    const target = new Date(now);
    target.setHours(8, 45, 0, 0);
    const delay = target.getTime() - now.getTime();
    const t = setTimeout(() => {
      new Notification('عِتْرَة · المسابقة', {
        body: '⏰ أسئلة اليوم تبدأ بعد ١٥ دقيقة، استعد!',
        icon: '/logo.png',
        tag: 'quiz-start',
      });
    }, delay);
    scheduledTimers.push(t);
  }

  // Before questions close at 9:30 PM — notify at 9:20 PM
  if (h < 21 || (h === 21 && m < 20)) {
    const target = new Date(now);
    target.setHours(21, 20, 0, 0);
    const delay = target.getTime() - now.getTime();
    if (delay > 0) {
      const t = setTimeout(() => {
        new Notification('عِتْرَة · المسابقة', {
          body: '⚡ باقي ١٠ دقائق على إغلاق أسئلة اليوم!',
          icon: '/logo.png',
          tag: 'quiz-close',
        });
      }, delay);
      scheduledTimers.push(t);
    }
  }
}

// Schedule dhikr and salawat reminders
export function scheduleDhikrReminders() {
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const h = now.getHours();

  // Morning dhikr at 7:00 AM
  if (localStorage.getItem('atraa_notif_dhikr') === 'true' && h < 7) {
    const target = new Date(now);
    target.setHours(7, 0, 0, 0);
    const t = setTimeout(() => {
      new Notification('عِتْرَة', {
        body: '🌅 صباح الخير، لا تنسَ أذكار الصباح',
        icon: '/logo.png',
        tag: 'dhikr-morning',
      });
    }, target.getTime() - now.getTime());
    scheduledTimers.push(t);
  }

  // Evening dhikr at 5:00 PM
  if (localStorage.getItem('atraa_notif_dhikr') === 'true' && h < 17) {
    const target = new Date(now);
    target.setHours(17, 0, 0, 0);
    const t = setTimeout(() => {
      new Notification('عِتْرَة', {
        body: '🌇 لا تنسَ أذكار المساء',
        icon: '/logo.png',
        tag: 'dhikr-evening',
      });
    }, target.getTime() - now.getTime());
    scheduledTimers.push(t);
  }

  // Salawat reminder at 12:00 PM
  if (localStorage.getItem('atraa_notif_salawat') === 'true' && h < 12) {
    const target = new Date(now);
    target.setHours(12, 0, 0, 0);
    const t = setTimeout(() => {
      new Notification('عِتْرَة', {
        body: '🤲🏻 اللهم صلِّ على محمد وآل محمد',
        icon: '/logo.png',
        tag: 'salawat',
      });
    }, target.getTime() - now.getTime());
    scheduledTimers.push(t);
  }

  // Daily dua reminder at 10:00 AM
  if (localStorage.getItem('atraa_notif_dua') === 'true' && h < 10) {
    const target = new Date(now);
    target.setHours(10, 0, 0, 0);
    const t = setTimeout(() => {
      new Notification('عِتْرَة', {
        body: '📖 لا تنسَ قراءة دعاء اليوم',
        icon: '/logo.png',
        tag: 'dua-daily',
      });
    }, target.getTime() - now.getTime());
    scheduledTimers.push(t);
  }
}
