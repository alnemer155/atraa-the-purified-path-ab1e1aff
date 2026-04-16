import { useState, useEffect } from 'react';
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
  const progress = hijri ? (hijri.day / hijri.daysInMonth) * 100 : 0;

  return (
    <div className="rounded-2xl bg-card border border-border/20 p-3.5 min-h-[100px] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] text-muted-foreground/40 tracking-widest font-light">التقويم</span>
      </div>
      {hijri ? (
        <div>
          <p className="text-[15px] text-foreground leading-snug">
            {hijri.day} {hijri.month}
          </p>
          <p className="text-[9px] text-muted-foreground/40 mt-0.5 font-light">{hijri.year} هـ</p>
          
          <div className="mt-2.5">
            <div className="h-[2px] rounded-full bg-secondary/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground/15 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[7px] text-muted-foreground/30 mt-1 font-light">
              {daysRemaining > 0 ? `${daysRemaining} يوم متبقي` : 'آخر يوم'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-4 w-20 rounded-md bg-secondary/30 animate-pulse" />
          <div className="h-2.5 w-14 rounded-md bg-secondary/20 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default HijriCountdown;
