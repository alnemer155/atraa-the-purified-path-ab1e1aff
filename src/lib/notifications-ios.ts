/**
 * iOS Adhan notifications — Capacitor LocalNotifications integration.
 *
 * Lazy-loaded so the web bundle stays small. On iOS (and Android), this
 * schedules native local notifications for the five daily prayers using
 * the system notification centre — required for the App Store submission
 * because web `Notification` API is unreliable when the WebView is
 * backgrounded.
 *
 * Usage from anywhere:
 *   import { scheduleIosAdhanNotifications } from '@/lib/notifications-ios';
 *   await scheduleIosAdhanNotifications(timings, { lang: 'ar' });
 *
 * On non-native platforms this is a no-op and falls back to the web
 * implementation in `notifications.ts`.
 */

interface PrayerTimings {
  Fajr?: string;
  Dhuhr?: string;
  Asr?: string;
  Maghrib?: string;
  Isha?: string;
  [k: string]: string | undefined;
}

interface ScheduleOpts {
  lang?: 'ar' | 'en';
  /** Minutes before prayer for an optional reminder (0 = at prayer time). */
  reminderOffsetMin?: number;
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

/** Stable numeric IDs (1..5) keep cancel/replace deterministic. */
const PRAYER_IDS: Record<string, number> = {
  Fajr: 1001,
  Dhuhr: 1002,
  Asr: 1003,
  Maghrib: 1004,
  Isha: 1005,
};

const isNative = (): boolean => {
  // @ts-expect-error — Capacitor injects a global at runtime
  const cap = (typeof window !== 'undefined' && window.Capacitor) as
    | { isNativePlatform?: () => boolean; getPlatform?: () => string }
    | undefined;
  return !!cap?.isNativePlatform?.();
};

export const isIosNative = (): boolean => {
  // @ts-expect-error — Capacitor global
  const cap = (typeof window !== 'undefined' && window.Capacitor) as
    | { getPlatform?: () => string }
    | undefined;
  return cap?.getPlatform?.() === 'ios';
};

/**
 * Request the iOS notification permission via Capacitor.
 * No-op (returns false) on web/non-native.
 */
export async function requestIosNotificationPermission(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const LocalNotifications = await loadLocalNotifications();
    if (!LocalNotifications) return false;
    const res = await LocalNotifications.requestPermissions();
    return res.display === 'granted';
  } catch {
    return false;
  }
}

/**
 * Cancel any previously scheduled adhan notifications (so we don't double up
 * after a re-schedule).
 */
export async function clearIosAdhanNotifications(): Promise<void> {
  if (!isNative()) return;
  try {
    const LocalNotifications = await loadLocalNotifications();
    if (!LocalNotifications) return 0;
    await LocalNotifications.cancel({
      notifications: Object.values(PRAYER_IDS).map((id) => ({ id })),
    });
  } catch {
    /* ignore */
  }
}

/**
 * Schedule the five daily prayer notifications natively. Replaces any
 * previously scheduled adhan reminders. Returns the number of notifications
 * actually scheduled.
 */
export async function scheduleIosAdhanNotifications(
  timings: PrayerTimings,
  opts: ScheduleOpts = {},
): Promise<number> {
  if (!isNative()) return 0;
  const lang = opts.lang ?? 'ar';
  const labels = lang === 'ar' ? PRAYER_LABELS_AR : PRAYER_LABELS_EN;
  const titlePrefix = lang === 'ar' ? 'حان وقت صلاة ' : 'Prayer time: ';
  const body = lang === 'ar' ? 'حان الآن وقت الصلاة' : 'It is time to pray.';
  const offsetMs = (opts.reminderOffsetMin ?? 0) * 60_000;

  try {
    await clearIosAdhanNotifications();
    const LocalNotifications = await loadLocalNotifications();
    if (!LocalNotifications) return 0;

    const now = Date.now();
    const items = Object.keys(labels)
      .map((key) => {
        const raw = timings[key];
        if (!raw) return null;
        const [h, m] = raw.split(' ')[0].split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return null;
        const at = new Date();
        at.setHours(h, m, 0, 0);
        const ts = at.getTime() - offsetMs;
        if (ts <= now) return null;
        return {
          id: PRAYER_IDS[key],
          title: titlePrefix + labels[key],
          body,
          schedule: { at: new Date(ts), allowWhileIdle: true },
          sound: 'adhan.caf',
          smallIcon: 'ic_stat_icon_config_sample',
          channelId: 'adhan',
          extra: { prayer: key },
        };
      })
      .filter(Boolean) as Array<Record<string, unknown>>;

    if (!items.length) return 0;

    // Ensure Android channel exists (no-op on iOS).
    try {
      await LocalNotifications.createChannel?.({
        id: 'adhan',
        name: 'Adhan',
        description: lang === 'ar' ? 'تذكيرات أوقات الصلاة' : 'Prayer time reminders',
        importance: 5,
        sound: 'adhan',
        visibility: 1,
      });
    } catch { /* not on iOS */ }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await LocalNotifications.schedule({ notifications: items as any });
    return items.length;
  } catch {
    return 0;
  }
}
