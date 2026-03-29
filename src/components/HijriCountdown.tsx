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

  const fetchHijri = (adj: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + adj);
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const yyyy = targetDate.getFullYear();

    fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=26.4207&longitude=50.0888&method=4&timezonestring=Asia/Riyadh`)
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
  };

  useEffect(() => {
    const adj = getHijriAdjustment();
    fetchHijri(adj);

    const handleCustomEvent = (e: CustomEvent) => {
      fetchHijri(e.detail as number);
    };
    window.addEventListener('hijri-adjust-changed', handleCustomEvent as EventListener);
    return () => window.removeEventListener('hijri-adjust-changed', handleCustomEvent as EventListener);
  }, []);

  const daysRemaining = hijri ? Math.max(0, hijri.daysInMonth - hijri.day) : 0;

  return (
    <div className="rounded-2xl bg-card p-3.5 shadow-card border border-border/30">
      <div className="flex items-center gap-1.5 mb-2">
        <Calendar className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] text-muted-foreground font-medium">التقويم الهجري</span>
      </div>
      {hijri ? (
        <>
          <p className="text-sm font-bold text-foreground">{hijri.day} {hijri.month}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {daysRemaining > 0 ? `${daysRemaining} يوم للشهر القادم` : 'آخر يوم في الشهر'}
          </p>
        </>
      ) : (
        <div className="h-10 rounded-lg bg-secondary/60 animate-pulse" />
      )}
    </div>
  );
};

export default HijriCountdown;
