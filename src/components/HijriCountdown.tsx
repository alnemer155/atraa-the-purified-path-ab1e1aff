import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface HijriData {
  day: number;
  month: string;
  monthNumber: number;
  year: number;
  daysInMonth: number;
}

const HijriCountdown = () => {
  const [hijri, setHijri] = useState<HijriData | null>(null);

  useEffect(() => {
    // Use the timings API which already returns hijri data
    fetch('https://api.aladhan.com/v1/timings?latitude=26.4207&longitude=50.0888&method=4&timezonestring=Asia/Riyadh&tune=2,2,0,0,-1,15,0,0,0,0')
      .then(res => res.json())
      .then(data => {
        const h = data?.data?.date?.hijri;
        if (h) {
          setHijri({
            day: parseInt(h.day),
            month: h.month.ar,
            monthNumber: parseInt(h.month.number),
            year: parseInt(h.year),
            daysInMonth: h.month.days || 30,
          });
        }
      })
      .catch(() => {});
  }, []);

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
