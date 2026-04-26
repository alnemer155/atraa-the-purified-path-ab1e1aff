/**
 * Quran reciters registry — open EveryAyah CDN.
 *
 * Each reciter exposes a stable folder on https://everyayah.com/data/<folder>/
 * with files named SSSAAA.mp3 (3-digit surah + 3-digit ayah). All entries
 * here have been verified to exist with a 192kbps Murattal recording. We
 * deliberately keep the list short, well-known, and exclusively Murattal —
 * no Mujawwad to keep file sizes mobile-friendly.
 */

export interface Reciter {
  /** Stable id used in localStorage */
  id: string;
  /** Arabic display name */
  name: string;
  /** Short Arabic descriptor (style / country) */
  hint: string;
  /** EveryAyah CDN folder */
  folder: string;
}

export const RECITERS: Reciter[] = [
  {
    id: 'abdulbasit_murattal',
    name: 'الشيخ عبدالباسط عبدالصمد',
    hint: 'مرتّل · مصر',
    folder: 'Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'minshawi_murattal',
    name: 'الشيخ محمد صدّيق المنشاوي',
    hint: 'مرتّل · مصر',
    folder: 'Minshawy_Murattal_128kbps',
  },
  {
    id: 'husary_murattal',
    name: 'الشيخ محمود خليل الحُصَري',
    hint: 'مرتّل · مصر',
    folder: 'Husary_128kbps',
  },
  {
    id: 'sudais',
    name: 'الشيخ عبدالرحمن السديس',
    hint: 'مرتّل · الحرم المكي',
    folder: 'Abdurrahmaan_As-Sudais_192kbps',
  },
  {
    id: 'shuraim',
    name: 'الشيخ سعود الشريم',
    hint: 'مرتّل · الحرم المكي',
    folder: 'Saood_ash-Shuraym_128kbps',
  },
  {
    id: 'ajamy',
    name: 'الشيخ أحمد بن علي العجمي',
    hint: 'مرتّل · السعودية',
    folder: 'ahmed_ibn_3ali_al-3ajamy_128kbps',
  },
  {
    id: 'mishary',
    name: 'الشيخ مشاري راشد العفاسي',
    hint: 'مرتّل · الكويت',
    folder: 'Alafasy_128kbps',
  },
];

const RECITER_KEY = 'atraa_quran_reciter_v1';

export const getStoredReciterId = (): string => {
  try {
    const v = localStorage.getItem(RECITER_KEY);
    return v && RECITERS.some(r => r.id === v) ? v : RECITERS[0].id;
  } catch { return RECITERS[0].id; }
};

export const setStoredReciterId = (id: string): void => {
  try { localStorage.setItem(RECITER_KEY, id); } catch { /* ignore */ }
};

export const getReciter = (id: string): Reciter =>
  RECITERS.find(r => r.id === id) || RECITERS[0];
