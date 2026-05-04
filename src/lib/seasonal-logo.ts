// Dynamic seasonal logo based on Hijri date
// Falls back to default logo outside special periods

import defaultLogo from '@/assets/logo-Atraa-v3.png';

const LOGOS = {
  default: defaultLogo,
  ghadeer: 'https://i.ibb.co/HLsGFbLW/phonto.png',
  muharram: 'https://i.ibb.co/zhftdKT4/phonto.png',
  ramadan: 'https://i.ibb.co/39Hxg2WW/phonto.png',
  fitr: 'https://i.ibb.co/k6qqqymG/phonto.png',
};

interface HijriDate {
  day: number;
  month: number;
}

function getHijriToday(): HijriDate {
  try {
    const fmt = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = fmt.formatToParts(new Date());
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
    return { day, month };
  } catch {
    return { day: 1, month: 1 };
  }
}

export function getSeasonalLogo(): string {
  const { day, month } = getHijriToday();
  if ((month === 9 && day >= 29) || (month === 10 && day <= 4)) return LOGOS.fitr;
  if ((month === 8 && day >= 27) || (month === 9 && day <= 27)) return LOGOS.ramadan;
  if ((month === 12 && day >= 28) || (month === 1 && day <= 14)) return LOGOS.muharram;
  if (month === 12 && day >= 15 && day <= 19) return LOGOS.ghadeer;
  return LOGOS.default;
}

export function getSeasonalLabel(): string | null {
  const { day, month } = getHijriToday();
  if ((month === 9 && day >= 29) || (month === 10 && day <= 4)) return 'عيد الفطر المبارك';
  if ((month === 8 && day >= 27) || (month === 9 && day <= 27)) return 'شهر رمضان المبارك';
  if ((month === 12 && day >= 28) || (month === 1 && day <= 14)) return 'شهر محرم الحرام';
  if (month === 12 && day >= 15 && day <= 19) return 'عيد الغدير الأغر';
  return null;
}
