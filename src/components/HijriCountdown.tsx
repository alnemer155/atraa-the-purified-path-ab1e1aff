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

  const fetchHijri = (adj: number) => {
    // Use the date endpoint with adjustment days offset
    const today = new Date();
    today.setDate(today.getDate() + adj);
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const dateStr = `${dd}-${mm}-${yyyy}`;

    fetch(`https://api.aladhan.com/v1/gpiToH/${dateStr}`)
      .then(res => res.json())
      .then(data => {
        const h = data?.data?.hijri;
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
    setAdjustment(adj);
    fetchHijri(adj);

    // Listen for hijri adjustment changes from settings (same tab)
    const handleCustomEvent = (e: CustomEvent) => {
      const newAdj = e.detail as number;
      setAdjustment(newAdj);
      fetchHijri(newAdj);
    };
    window.addEventListener('hijri-adjust-changed', handleCustomEvent as EventListener);
    return () => window.removeEventListener('hijri-adjust-changed', handleCustomEvent as EventListener);
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
