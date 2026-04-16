import { useState, useEffect } from 'react';
import logoAr from '@/assets/logos/logo-ar.png';
import logoMuharram from '@/assets/logos/logo-muharram.png';
import logoRamadan from '@/assets/logos/logo-ramadan.png';
import { detectSeason, type Season } from '@/lib/hijri-seasons';
import { getHijriAdjustment } from '@/lib/user';

const logoMap: Record<Season, string> = {
  muharram: logoMuharram,
  ramadan: logoRamadan,
  default: logoAr,
};

const AppHeader = () => {
  const [season, setSeason] = useState<Season>('default');

  useEffect(() => {
    const adj = getHijriAdjustment();
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
          setSeason(detectSeason(parseInt(h.month.number), parseInt(h.day)));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-3xl backdrop-saturate-200">
      <div className="flex items-center justify-end px-5 py-2 max-w-lg mx-auto">
        <img src={logoMap[season]} alt="عِتَرَةً" className="h-7 w-auto object-contain" />
      </div>
      <div className="h-px bg-border/10" />
    </header>
  );
};

export default AppHeader;
