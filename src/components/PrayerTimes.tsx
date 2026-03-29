import { useState, useEffect } from 'react';
import { Sun, Sunrise, Moon, CloudSun, Bell, BellOff } from 'lucide-react';
import { requestNotificationPermission, schedulePrayerNotifications, getNotificationPermission } from '@/lib/notifications';

interface TimingsData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const CITY_PRAYER_CONFIG: Record<string, { lat: number; lng: number; tune: string }> = {
  Ahsa: { lat: 25.3548, lng: 49.5870, tune: '10,10,8,8,8,23,0,24,0,0,0' },
  Riyadh: { lat: 24.7136, lng: 46.6753, tune: '17,17,13,14,14,29,6,38,0,0,0' },
  Jeddah: { lat: 21.4858, lng: 39.1925, tune: '48,48,43,44,44,60,37,132,0,0,0' },
  Khobar: { lat: 26.2172, lng: 50.1971, tune: '2,2,0,0,-1,15,0,0,0,0' },
  Qatif: { lat: 26.5196, lng: 50.0115, tune: '2,2,0,0,-1,15,0,0,0,0' },
  Saihat: { lat: 26.4789, lng: 50.0437, tune: '2,2,0,0,-1,15,0,0,0,0' },
  Tarut: { lat: 26.5667, lng: 50.0667, tune: '2,2,0,0,-1,15,0,0,0,0' },
  Dammam: { lat: 26.3927, lng: 49.9777, tune: '2,2,0,0,-1,15,0,0,0,0' },
  Jubail: { lat: 27.0046, lng: 49.6222, tune: '2,2,0,0,-1,15,0,0,0,0' },
};

const SUPPORTED_CITIES = new Set(Object.keys(CITY_PRAYER_CONFIG));
const DEFAULT_CONFIG = { lat: 26.4207, lng: 50.0888, tune: '2,2,0,0,-1,15,0,0,0,0' };

function to12Hour(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'م' : 'ص';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

function toMinutes(time24: string): number {
  const [h, m] = time24.split(':').map(Number);
  return h * 60 + m;
}

const prayerInfo = [
  { key: 'Fajr', label: 'الفجر', icon: Moon },
  { key: 'Sunrise', label: 'الشروق', icon: Sunrise },
  { key: 'Dhuhr', label: 'الظهر', icon: Sun },
  { key: 'Asr', label: 'العصر', icon: CloudSun },
  { key: 'Maghrib', label: 'المغرب', icon: Sunrise },
  { key: 'Isha', label: 'العشاء', icon: Moon },
];

function getCurrentAndNext(timings: TimingsData): { current: string | null; next: string | null } {
  const now = new Date();
  const riyadhTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const nowMinutes = riyadhTime.getHours() * 60 + riyadhTime.getMinutes();
  
  const times = prayerInfo.map(p => ({
    key: p.key,
    minutes: toMinutes((timings as any)[p.key]?.split(' ')[0] || '0:0'),
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
    current = null;
    next = times[0]?.key || null;
  }

  return { current, next };
}

const PrayerTimes = () => {
  const [timings, setTimings] = useState<TimingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(() => getNotificationPermission() === 'granted');
  const [indicators, setIndicators] = useState<{ current: string | null; next: string | null }>({ current: null, next: null });
  const [currentCity, setCurrentCity] = useState(() => localStorage.getItem('atraa_weather_city') || 'Qatif');
  const isSupported = SUPPORTED_CITIES.has(currentCity);

  useEffect(() => {
    const city = localStorage.getItem('atraa_weather_city') || 'Qatif';
    const config = CITY_PRAYER_CONFIG[city] || DEFAULT_CONFIG;
    const url = `https://api.aladhan.com/v1/timings?latitude=${config.lat}&longitude=${config.lng}&method=4&timezonestring=Asia/Riyadh&tune=${config.tune}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const t = data.data.timings;
        setTimings(t);
        setIndicators(getCurrentAndNext(t));
        setLoading(false);
        if (getNotificationPermission() === 'granted') {
          schedulePrayerNotifications(t);
        }
      })
      .catch(() => setLoading(false));

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'atraa_weather_city' && e.newValue) {
        setCurrentCity(e.newValue);
        const newConfig = CITY_PRAYER_CONFIG[e.newValue];
        if (!newConfig) return;
        const newUrl = `https://api.aladhan.com/v1/timings?latitude=${newConfig.lat}&longitude=${newConfig.lng}&method=4&timezonestring=Asia/Riyadh&tune=${newConfig.tune}`;
        fetch(newUrl)
          .then(res => res.json())
          .then(data => {
            const t = data.data.timings;
            setTimings(t);
            setIndicators(getCurrentAndNext(t));
          })
          .catch(() => {});
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleToggleNotif = async () => {
    if (notifEnabled) return;
    const granted = await requestNotificationPermission();
    setNotifEnabled(granted);
    if (granted && timings) {
      schedulePrayerNotifications(timings);
    }
  };

  useEffect(() => {
    if (!timings) return;
    const interval = setInterval(() => {
      setIndicators(getCurrentAndNext(timings));
    }, 60000);
    return () => clearInterval(interval);
  }, [timings]);

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card border border-border/30">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">أوقات الصلاة</h2>
        {isSupported && (
          <button
            onClick={handleToggleNotif}
            className={`p-1.5 rounded-lg transition-colors ${notifEnabled ? 'bg-primary/8 text-primary' : 'text-muted-foreground/50 hover:text-foreground'}`}
          >
            {notifEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {!isSupported ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <span className="text-2xl">⏳</span>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            سيتم دعم <span className="font-semibold text-foreground">{currentCity}</span> قريباً بإذن الله
          </p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      ) : timings ? (
        <div className="grid grid-cols-3 gap-1.5">
          {prayerInfo.map(({ key, label, icon: Icon }) => {
            const isCurrent = indicators.current === key;
            const isNext = indicators.next === key;
            return (
              <div
                key={key}
                className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'islamic-gradient shadow-card'
                    : isNext
                    ? 'bg-primary/6 border border-primary/15'
                    : 'bg-secondary/40'
                }`}
              >
                {(isCurrent || isNext) && (
                  <span className={`absolute -top-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                    isCurrent
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary/15 text-primary'
                  }`}>
                    {isCurrent ? 'الآن' : 'التالي'}
                  </span>
                )}
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-primary-foreground' : 'text-primary'}`} />
                <span className={`text-[10px] ${isCurrent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{label}</span>
                <span className={`text-[13px] font-bold ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {to12Hour((timings as any)[key]?.split(' ')[0] || '')}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">تعذر تحميل أوقات الصلاة</p>
      )}
    </div>
  );
};

export default PrayerTimes;
