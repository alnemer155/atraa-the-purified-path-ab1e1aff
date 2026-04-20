// Dynamic seasonal logo based on Hijri date
// Falls back to default logo outside special periods

import defaultLogo from '@/assets/logo-v11.png';

const LOGOS = {
  default: defaultLogo,
  ghadeer: 'https://i.ibb.co/HLsGFbLW/phonto.png',
  muharram: 'https://i.ibb.co/zhftdKT4/phonto.png',
  ramadan: 'https://i.ibb.co/39Hxg2WW/phonto.png',
  fitr: 'https://i.ibb.co/k6qqqymG/phonto.png',
};

interface HijriDate {
  day: number;
  month: number; // 1-12
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

/**
 * Returns the appropriate seasonal logo URL based on the current Hijri date.
 * Periods (inclusive):
 *  - Eid al-Ghadeer:  15 Dhul-Hijjah → 19 Dhul-Hijjah    (month 12)
 *  - Muharram:        28 Dhul-Hijjah → 14 Muharram       (month 12 → month 1)
 *  - Ramadan:         27 Sha'ban     → 27 Ramadan        (month 8 → month 9)
 *  - Eid al-Fitr:     29 Ramadan     → 4 Shawwal         (month 9 → month 10)
 */
export function getSeasonalLogo(): string {
  const { day, month } = getHijriToday();

  // Eid al-Fitr: 29 Ramadan – 4 Shawwal
  if ((month === 9 && day >= 29) || (month === 10 && day <= 4)) {
    return LOGOS.fitr;
  }
  // Ramadan: 27 Sha'ban – 27 Ramadan (Fitr takes over from 29)
  if ((month === 8 && day >= 27) || (month === 9 && day <= 27)) {
    return LOGOS.ramadan;
  }
  // Muharram: 28 Dhul-Hijjah – 14 Muharram
  if ((month === 12 && day >= 28) || (month === 1 && day <= 14)) {
    return LOGOS.muharram;
  }
  // Eid al-Ghadeer: 15–19 Dhul-Hijjah
  if (month === 12 && day >= 15 && day <= 19) {
    return LOGOS.ghadeer;
  }
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
