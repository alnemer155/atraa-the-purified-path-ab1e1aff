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
      .catch(() => {
        // Fallback - still show widget structure
      });
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
    <div className="rounded-2xl glass-card p-4 min-h-[110px] flex flex-col justify-between relative overflow-hidden">

      <div className="flex items-center justify-between mb-3 relative">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">التقويم</span>
        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
          <Calendar className="w-3.5 h-3.5 text-primary/70" />
        </div>
      </div>
      {hijri ? (
        <div className="relative">
          <p className="text-[16px] font-bold text-foreground leading-snug">
            {hijri.day} {hijri.month}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">{hijri.year} هـ</p>
          
          {/* Progress bar */}
          <div className="mt-3 relative">
            <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
              <div
                className="h-full rounded-full islamic-gradient transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[9px] text-muted-foreground/60 font-medium">
                {daysRemaining > 0 ? `${daysRemaining} يوم متبقي` : 'آخر يوم'}
              </p>
              <p className="text-[9px] text-primary/50 font-bold">{Math.round(progress)}%</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="h-5 w-24 rounded-lg bg-secondary/50 animate-pulse" />
          <div className="h-3 w-16 rounded-lg bg-secondary/30 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default HijriCountdown;
