import { useState, useEffect } from 'react';
import { Sun, Sunrise, Moon, CloudSun } from 'lucide-react';

interface TimingsData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

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
  // Use Riyadh timezone for accurate comparison
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
  const [indicators, setIndicators] = useState<{ current: string | null; next: string | null }>({ current: null, next: null });

  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timings?latitude=26.4207&longitude=50.0888&method=0&timezonestring=Asia/Riyadh&tune=0,3,0,2,0,3,2,0,0')
      .then(res => res.json())
      .then(data => {
        const t = data.data.timings;
        setTimings(t);
        setIndicators(getCurrentAndNext(t));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Update current/next every minute
  useEffect(() => {
    if (!timings) return;
    const interval = setInterval(() => {
      setIndicators(getCurrentAndNext(timings));
    }, 60000);
    return () => clearInterval(interval);
  }, [timings]);

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <h2 className="text-base font-semibold text-foreground mb-3">أوقات الصلاة</h2>
      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : timings ? (
        <div className="grid grid-cols-3 gap-2">
          {prayerInfo.map(({ key, label, icon: Icon }) => {
            const isCurrent = indicators.current === key;
            const isNext = indicators.next === key;
            return (
              <div
                key={key}
                className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-colors ${
                  isCurrent
                    ? 'islamic-gradient shadow-card'
                    : isNext
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-primary-light'
                }`}
              >
                {/* Badge */}
                {(isCurrent || isNext) && (
                  <span className={`absolute -top-2 text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                    isCurrent
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {isCurrent ? 'الآن' : 'التالي'}
                  </span>
                )}
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-primary-foreground' : 'text-primary'}`} />
                <span className={`text-xs ${isCurrent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{label}</span>
                <span className={`text-sm font-semibold ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {to12Hour((timings as any)[key]?.split(' ')[0] || '')}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">تعذر تحميل أوقات الصلاة</p>
      )}
    </div>
  );
};

export default PrayerTimes;
