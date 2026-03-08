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

const prayerInfo = [
  { key: 'Fajr', label: 'الفجر', icon: Moon },
  { key: 'Sunrise', label: 'الشروق', icon: Sunrise },
  { key: 'Dhuhr', label: 'الظهر', icon: Sun },
  { key: 'Asr', label: 'العصر', icon: CloudSun },
  { key: 'Maghrib', label: 'المغرب', icon: Sunrise },
  { key: 'Isha', label: 'العشاء', icon: Moon },
];

const PrayerTimes = () => {
  const [timings, setTimings] = useState<TimingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timings?latitude=26.4207&longitude=50.0888&method=4&timezonestring=Asia/Riyadh&tune=2,2,0,0,-1,15,0,0,0,0')
      .then(res => res.json())
      .then(data => {
        setTimings(data.data.timings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
          {prayerInfo.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-primary-light transition-colors"
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-sm font-semibold text-foreground">
                {to12Hour((timings as any)[key]?.split(' ')[0] || '')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">تعذر تحميل أوقات الصلاة</p>
      )}
    </div>
  );
};

export default PrayerTimes;
