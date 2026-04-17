import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { requestNotificationPermission, schedulePrayerNotifications, getNotificationPermission } from '@/lib/notifications';

interface TimingsData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [k: string]: string;
}

interface CityCoords {
  lat: number;
  lng: number;
}

function to12Hour(time24: string, lang: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? (lang === 'ar' ? 'م' : 'PM') : (lang === 'ar' ? 'ص' : 'AM');
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

function toMinutes(time24: string): number {
  const [h, m] = time24.split(':').map(Number);
  return h * 60 + m;
}

const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function getCurrentAndNext(timings: TimingsData): { current: string | null; next: string | null } {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const times = PRAYER_KEYS.map(k => ({
    key: k,
    minutes: toMinutes(timings[k]?.split(' ')[0] || '0:0'),
  }));

  let current: string | null = null;
  let next: string | null = null;

  for (let i = times.length - 1; i >= 0; i--) {
    if (nowMinutes >= times[i].minutes) {
      current = times[i].key;
      next = i + 1 < times.length ? times[i + 1].key : null;
      break;
    }
  }

  if (!current) {
    next = times[0]?.key || null;
  }

  return { current, next };
}

function getStoredCoords(): CityCoords {
  try {
    const raw = localStorage.getItem('atraa_city_coords');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { lat: 26.5196, lng: 50.0115 }; // default: Qatif
}

const PrayerTimes = () => {
  const { t, i18n } = useTranslation();
  const [timings, setTimings] = useState<TimingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(() => getNotificationPermission() === 'granted' && localStorage.getItem('atraa_notif_adhan') === 'true');
  const [indicators, setIndicators] = useState<{ current: string | null; next: string | null }>({ current: null, next: null });
  const [coords, setCoords] = useState<CityCoords>(getStoredCoords);

  useEffect(() => {
    const fetchTimings = (c: CityCoords) => {
      const url = `https://api.aladhan.com/v1/timings?latitude=${c.lat}&longitude=${c.lng}&method=4`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const tt = data.data.timings as TimingsData;
          setTimings(tt);
          setIndicators(getCurrentAndNext(tt));
          setLoading(false);
          if (notifEnabled) schedulePrayerNotifications(tt);
        })
        .catch(() => setLoading(false));
    };

    fetchTimings(coords);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'atraa_city_coords' && e.newValue) {
        try {
          const c = JSON.parse(e.newValue);
          setCoords(c);
          setLoading(true);
          fetchTimings(c);
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!timings) return;
    const interval = setInterval(() => {
      setIndicators(getCurrentAndNext(timings));
    }, 60000);
    return () => clearInterval(interval);
  }, [timings]);

  const handleToggleNotif = async () => {
    if (notifEnabled) {
      localStorage.setItem('atraa_notif_adhan', 'false');
      setNotifEnabled(false);
      return;
    }
    const granted = await requestNotificationPermission();
    if (granted) {
      localStorage.setItem('atraa_notif_adhan', 'true');
      setNotifEnabled(true);
      if (timings) schedulePrayerNotifications(timings);
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border/40 p-4 shadow-card">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[13px] font-semibold text-foreground">{t('home.prayerTimes')}</h2>
        <button
          onClick={handleToggleNotif}
          className={`p-1.5 rounded-lg transition-colors ${notifEnabled ? 'text-primary' : 'text-muted-foreground/40'}`}
          aria-label="toggle prayer notifications"
        >
          {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-3 gap-1.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[72px] rounded-xl bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : timings ? (
        <div className="grid grid-cols-3 gap-1.5">
          {PRAYER_KEYS.map((key) => {
            const isCurrent = indicators.current === key;
            const isNext = indicators.next === key;
            return (
              <div
                key={key}
                className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isNext
                    ? 'bg-primary/8 border border-primary/15'
                    : 'bg-secondary/40'
                }`}
              >
                {(isCurrent || isNext) && (
                  <span className={`absolute -top-1.5 text-[8px] px-1.5 py-px rounded-full ${
                    isCurrent
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary/15 text-primary'
                  }`}>
                    {isCurrent ? t('home.now') : t('home.next')}
                  </span>
                )}
                <span className={`text-[10px] font-medium ${isCurrent ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
                  {t(`prayers.${key}`)}
                </span>
                <span className={`text-[12px] tabular-nums font-medium ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {to12Hour(timings[key]?.split(' ')[0] || '', i18n.language)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground text-center py-6">{t('home.loadingError')}</p>
      )}
    </div>
  );
};

export default PrayerTimes;
