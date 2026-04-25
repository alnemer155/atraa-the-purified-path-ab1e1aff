/**
 * Mushaf page loader — uses the official Madinah Mushaf text from
 * alquran.cloud (edition: `quran-uthmani`, the Tanzil-verified Uthmani text).
 * Rendered with the local KFGQPC Uthmanic Script font for an authentic
 * Madinah Mushaf appearance.
 */

const API = 'https://api.alquran.cloud/v1/page';
const LS_PREFIX = 'atraa_quran_page_text_v1_';

export interface PageAyah {
  number: number;            // global ayah number
  text: string;              // Uthmani text (no end-of-ayah marker — added by us)
  numberInSurah: number;
  surah: {
    number: number;
    name: string;            // Arabic surah name (e.g. "سُورَةُ البَقَرَة")
    englishName: string;
    revelationType: 'Meccan' | 'Medinan';
    numberOfAyahs: number;
  };
}

export interface PageData {
  page_number: number;
  ayahs: PageAyah[];
  /** Distinct surahs that begin on this page (for the illuminated header) */
  surahStarts: PageAyah['surah'][];
}

export async function fetchPageText(page: number): Promise<PageData> {
  const lsKey = `${LS_PREFIX}${page}`;
  try {
    const cached = localStorage.getItem(lsKey);
    if (cached) {
      const parsed = JSON.parse(cached) as PageData;
      if (parsed?.ayahs?.length && parsed.page_number === page) return parsed;
    }
  } catch { /* ignore */ }

  const r = await fetch(`${API}/${page}/quran-uthmani`);
  if (!r.ok) throw new Error(`Failed to load page ${page}`);
  const json = await r.json();
  const rawAyahs = json?.data?.ayahs;
  if (!Array.isArray(rawAyahs) || rawAyahs.length === 0) {
    throw new Error(`No ayahs returned for page ${page}`);
  }

  const ayahs: PageAyah[] = rawAyahs.map((a: any) => ({
    number: a.number,
    text: a.text,
    numberInSurah: a.numberInSurah,
    surah: {
      number: a.surah.number,
      name: a.surah.name,
      englishName: a.surah.englishName,
      revelationType: a.surah.revelationType,
      numberOfAyahs: a.surah.numberOfAyahs,
    },
  }));

  // First ayah of any surah present on this page = surah start banner
  const surahStarts: PageAyah['surah'][] = [];
  const seen = new Set<number>();
  for (const a of ayahs) {
    if (a.numberInSurah === 1 && !seen.has(a.surah.number)) {
      surahStarts.push(a.surah);
      seen.add(a.surah.number);
    }
  }

  const result: PageData = { page_number: page, ayahs, surahStarts };
  try { localStorage.setItem(lsKey, JSON.stringify(result)); } catch { /* quota */ }
  return result;
}

/**
 * Convert a Western digit to Arabic-Indic numerals.
 */
export const toArabicNumerals = (n: number | string): string =>
  String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

/**
 * Strip "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" from the start of an ayah.
 * In the Uthmani text, every surah's first ayah (except At-Tawbah) BEGINS
 * with the basmalah and we render the basmalah separately as part of the
 * illuminated surah header.
 */
export const stripBasmalah = (text: string): string => {
  // Cover both spellings (with/without superscript alif)
  return text
    .replace(/^بِسْمِ\s*ٱللَّ[هـ]ِ\s*ٱلرَّحْمَ[ـٰ]ـ?نِ\s*ٱلرَّحِيمِ\s*/u, '')
    .replace(/^بِسْمِ\s*ٱللَّهِ\s*ٱلرَّحْم[َـٰ]نِ\s*ٱلرَّحِيمِ\s*/u, '');
};
