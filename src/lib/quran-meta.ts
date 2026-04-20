// Quran metadata — Sajdah ayahs (Shia + standard), Juz/Hizb starting points,
// and "continue reading" persistence.

export interface ContinueReading {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  timestamp: number;
}

const KEY = 'atraa_quran_continue';

export function saveContinueReading(c: ContinueReading): void {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

export function getContinueReading(): ContinueReading | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ContinueReading) : null;
  } catch { return null; }
}

/** Sajdah ayahs in the Mushaf. Format: [surah, ayah, type] type: 'wajib' | 'mustahabb' (per Ja'fari fiqh). */
export const SAJDAH_AYAHS: { surah: number; ayah: number; type: 'wajib' | 'mustahabb' }[] = [
  // Wajib (per Shia Ja'fari): 4 verses
  { surah: 32, ayah: 15, type: 'wajib' },     // As-Sajdah
  { surah: 41, ayah: 37, type: 'wajib' },     // Fussilat (some say 38)
  { surah: 53, ayah: 62, type: 'wajib' },     // An-Najm
  { surah: 96, ayah: 19, type: 'wajib' },     // Al-'Alaq
  // Mustahabb
  { surah: 7, ayah: 206, type: 'mustahabb' }, // Al-A'raf
  { surah: 13, ayah: 15, type: 'mustahabb' }, // Ar-Ra'd
  { surah: 16, ayah: 49, type: 'mustahabb' }, // An-Nahl
  { surah: 17, ayah: 109, type: 'mustahabb' },// Al-Isra
  { surah: 19, ayah: 58, type: 'mustahabb' }, // Maryam
  { surah: 22, ayah: 18, type: 'mustahabb' }, // Al-Hajj
  { surah: 22, ayah: 77, type: 'mustahabb' }, // Al-Hajj (2nd)
  { surah: 25, ayah: 60, type: 'mustahabb' }, // Al-Furqan
  { surah: 27, ayah: 26, type: 'mustahabb' }, // An-Naml
  { surah: 38, ayah: 24, type: 'mustahabb' }, // Sad
  { surah: 84, ayah: 21, type: 'mustahabb' }, // Al-Inshiqaq
];

export function getSajdahType(surah: number, ayah: number): 'wajib' | 'mustahabb' | null {
  const found = SAJDAH_AYAHS.find(s => s.surah === surah && s.ayah === ayah);
  return found?.type || null;
}

/** Juz' (الجزء) start points — 30 entries: [juzNumber, surah, ayah]. */
export const JUZ_STARTS: { juz: number; surah: number; ayah: number; nameAr: string }[] = [
  { juz: 1, surah: 1, ayah: 1, nameAr: 'الم' },
  { juz: 2, surah: 2, ayah: 142, nameAr: 'سيقول' },
  { juz: 3, surah: 2, ayah: 253, nameAr: 'تلك الرسل' },
  { juz: 4, surah: 3, ayah: 93, nameAr: 'لن تنالوا' },
  { juz: 5, surah: 4, ayah: 24, nameAr: 'والمحصنات' },
  { juz: 6, surah: 4, ayah: 148, nameAr: 'لا يحب الله' },
  { juz: 7, surah: 5, ayah: 82, nameAr: 'وإذا سمعوا' },
  { juz: 8, surah: 6, ayah: 111, nameAr: 'ولو أننا' },
  { juz: 9, surah: 7, ayah: 88, nameAr: 'قال الملأ' },
  { juz: 10, surah: 8, ayah: 41, nameAr: 'واعلموا' },
  { juz: 11, surah: 9, ayah: 93, nameAr: 'إنما السبيل' },
  { juz: 12, surah: 11, ayah: 6, nameAr: 'وما من دابة' },
  { juz: 13, surah: 12, ayah: 53, nameAr: 'وما أبرئ' },
  { juz: 14, surah: 15, ayah: 1, nameAr: 'ربما' },
  { juz: 15, surah: 17, ayah: 1, nameAr: 'سبحان الذي' },
  { juz: 16, surah: 18, ayah: 75, nameAr: 'قال ألم' },
  { juz: 17, surah: 21, ayah: 1, nameAr: 'اقترب للناس' },
  { juz: 18, surah: 23, ayah: 1, nameAr: 'قد أفلح' },
  { juz: 19, surah: 25, ayah: 21, nameAr: 'وقال الذين' },
  { juz: 20, surah: 27, ayah: 56, nameAr: 'فما كان جواب' },
  { juz: 21, surah: 29, ayah: 46, nameAr: 'اتل ما أوحي' },
  { juz: 22, surah: 33, ayah: 31, nameAr: 'ومن يقنت' },
  { juz: 23, surah: 36, ayah: 28, nameAr: 'وما أنزلنا' },
  { juz: 24, surah: 39, ayah: 32, nameAr: 'فمن أظلم' },
  { juz: 25, surah: 41, ayah: 47, nameAr: 'إليه يرد' },
  { juz: 26, surah: 46, ayah: 1, nameAr: 'حم الأحقاف' },
  { juz: 27, surah: 51, ayah: 31, nameAr: 'قال فما خطبكم' },
  { juz: 28, surah: 58, ayah: 1, nameAr: 'قد سمع الله' },
  { juz: 29, surah: 67, ayah: 1, nameAr: 'تبارك الذي' },
  { juz: 30, surah: 78, ayah: 1, nameAr: 'عمّ' },
];

/** Hizb (الحزب) — 60 hizbs total (each juz = 2 hizbs). */
export const HIZB_STARTS: { hizb: number; juz: number; surah: number; ayah: number }[] = [
  { hizb: 1, juz: 1, surah: 1, ayah: 1 },
  { hizb: 2, juz: 1, surah: 2, ayah: 75 },
  { hizb: 3, juz: 2, surah: 2, ayah: 142 },
  { hizb: 4, juz: 2, surah: 2, ayah: 203 },
  { hizb: 5, juz: 3, surah: 2, ayah: 253 },
  { hizb: 6, juz: 3, surah: 3, ayah: 15 },
  { hizb: 7, juz: 4, surah: 3, ayah: 93 },
  { hizb: 8, juz: 4, surah: 3, ayah: 170 },
  { hizb: 9, juz: 5, surah: 4, ayah: 24 },
  { hizb: 10, juz: 5, surah: 4, ayah: 88 },
  { hizb: 11, juz: 6, surah: 4, ayah: 148 },
  { hizb: 12, juz: 6, surah: 5, ayah: 27 },
  { hizb: 13, juz: 7, surah: 5, ayah: 82 },
  { hizb: 14, juz: 7, surah: 6, ayah: 36 },
  { hizb: 15, juz: 8, surah: 6, ayah: 111 },
  { hizb: 16, juz: 8, surah: 7, ayah: 1 },
  { hizb: 17, juz: 9, surah: 7, ayah: 88 },
  { hizb: 18, juz: 9, surah: 7, ayah: 171 },
  { hizb: 19, juz: 10, surah: 8, ayah: 41 },
  { hizb: 20, juz: 10, surah: 9, ayah: 34 },
  { hizb: 21, juz: 11, surah: 9, ayah: 93 },
  { hizb: 22, juz: 11, surah: 10, ayah: 26 },
  { hizb: 23, juz: 12, surah: 11, ayah: 6 },
  { hizb: 24, juz: 12, surah: 12, ayah: 7 },
  { hizb: 25, juz: 13, surah: 12, ayah: 53 },
  { hizb: 26, juz: 13, surah: 14, ayah: 1 },
  { hizb: 27, juz: 14, surah: 15, ayah: 1 },
  { hizb: 28, juz: 14, surah: 16, ayah: 51 },
  { hizb: 29, juz: 15, surah: 17, ayah: 1 },
  { hizb: 30, juz: 15, surah: 18, ayah: 1 },
  { hizb: 31, juz: 16, surah: 18, ayah: 75 },
  { hizb: 32, juz: 16, surah: 20, ayah: 1 },
  { hizb: 33, juz: 17, surah: 21, ayah: 1 },
  { hizb: 34, juz: 17, surah: 22, ayah: 1 },
  { hizb: 35, juz: 18, surah: 23, ayah: 1 },
  { hizb: 36, juz: 18, surah: 25, ayah: 1 },
  { hizb: 37, juz: 19, surah: 25, ayah: 21 },
  { hizb: 38, juz: 19, surah: 27, ayah: 1 },
  { hizb: 39, juz: 20, surah: 27, ayah: 56 },
  { hizb: 40, juz: 20, surah: 29, ayah: 1 },
  { hizb: 41, juz: 21, surah: 29, ayah: 46 },
  { hizb: 42, juz: 21, surah: 33, ayah: 1 },
  { hizb: 43, juz: 22, surah: 33, ayah: 31 },
  { hizb: 44, juz: 22, surah: 34, ayah: 24 },
  { hizb: 45, juz: 23, surah: 36, ayah: 28 },
  { hizb: 46, juz: 23, surah: 38, ayah: 1 },
  { hizb: 47, juz: 24, surah: 39, ayah: 32 },
  { hizb: 48, juz: 24, surah: 40, ayah: 41 },
  { hizb: 49, juz: 25, surah: 41, ayah: 47 },
  { hizb: 50, juz: 25, surah: 43, ayah: 24 },
  { hizb: 51, juz: 26, surah: 46, ayah: 1 },
  { hizb: 52, juz: 26, surah: 48, ayah: 18 },
  { hizb: 53, juz: 27, surah: 51, ayah: 31 },
  { hizb: 54, juz: 27, surah: 54, ayah: 1 },
  { hizb: 55, juz: 28, surah: 58, ayah: 1 },
  { hizb: 56, juz: 28, surah: 62, ayah: 1 },
  { hizb: 57, juz: 29, surah: 67, ayah: 1 },
  { hizb: 58, juz: 29, surah: 71, ayah: 1 },
  { hizb: 59, juz: 30, surah: 78, ayah: 1 },
  { hizb: 60, juz: 30, surah: 87, ayah: 1 },
];
