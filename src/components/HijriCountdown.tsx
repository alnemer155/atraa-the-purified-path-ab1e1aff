import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { getHijriAdjustment } from '@/lib/user';

interface HijriData {
  day: number;
  month: string;
  monthNumber: number;
  year: number;
  daysInMonth: number;
}

const HijriCountdown = () => {
  const [hijri, setHijri] = useState<HijriData | null>(null);
  const [adjustment, setAdjustment] = useState(() => getHijriAdjustment());

  useEffect(() => {
    const adj = getHijriAdjustment();
    setAdjustment(adj);

    fetch(`https://api.aladhan.com/v1/timings?latitude=26.4207&longitude=50.0888&method=0&timezonestring=Asia/Riyadh&adjustment=${adj}`)
      .then(res => res.json())
      .then(data => {
        const h = data?.data?.date?.hijri;
        if (h) {
          setHijri({
            day: parseInt(h.day),
            month: h.month.ar,
            monthNumber: parseInt(h.month.number),
            year: parseInt(h.year),
            daysInMonth: h.month.days ? parseInt(h.month.days) : 30,
          });
        }
      })
      .catch(() => {});

    // Listen for hijri adjustment changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'atraa_hijri_adjust') {
        const newAdj = parseInt(e.newValue || '0', 10);
        setAdjustment(newAdj);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Refetch when adjustment changes
  useEffect(() => {
    fetch(`https://api.aladhan.com/v1/timings?latitude=26.4207&longitude=50.0888&method=0&timezonestring=Asia/Riyadh&adjustment=${adjustment}`)
      .then(res => res.json())
      .then(data => {
        const h = data?.data?.date?.hijri;
        if (h) {
          setHijri({
            day: parseInt(h.day),
            month: h.month.ar,
            monthNumber: parseInt(h.month.number),
            year: parseInt(h.year),
            daysInMonth: h.month.days ? parseInt(h.month.days) : 30,
          });
        }
      })
      .catch(() => {});
  }, [adjustment]);

  const daysRemaining = hijri ? Math.max(0, hijri.daysInMonth - hijri.day) : 0;

  return (
    <div className="rounded-2xl bg-card p-3.5 shadow-card">
      <div className="flex items-center gap-2 mb-1.5">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">التقويم الهجري</span>
      </div>
      {hijri ? (
        <>
          <p className="text-sm font-semibold text-foreground">{hijri.day} {hijri.month}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {daysRemaining > 0 ? `${daysRemaining} يوم للشهر القادم` : 'آخر يوم في الشهر'}
          </p>
        </>
      ) : (
        <div className="h-10 rounded-lg bg-secondary animate-pulse" />
      )}
    </div>
  );
};

export default HijriCountdown;
