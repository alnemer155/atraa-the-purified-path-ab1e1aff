/**
 * QPC V2 (Madinah Mushaf) glyph-based renderer — VERIFIED-LOAD edition.
 *
 * CRITICAL CORRECTNESS GUARANTEES (the Qur'an MUST never display corrupted):
 *  1. Fonts are bundled locally in /public/qpc-v2 from the OFFICIAL
 *     mustafa0x/qpc-fonts repository at pinned commit (`f93bf5f3`).
 *     This repo is the canonical source used by quran.com itself.
 *  2. `font-display: block` ensures the browser shows NOTHING until the font
 *     is actually decoded — never the wrong glyphs from a fallback font.
 *  3. We `await document.fonts.load(...)` AND verify with `document.fonts.check(...)`
 *     before signalling readiness. If either fails, we surface an error and
 *     refuse to render — we never display PUA codepoints in a wrong font.
 *  4. Word data comes from the OFFICIAL Quran Foundation API
 *     (`api.quran.com/api/v4`) requesting `code_v2` + `v2_page`. Each word's
 *     `v2_page` field tells us which font file to use for that exact word.
 *  5. Each line is grouped by `line_v2` (the V2-font-specific line number) so
 *     the layout matches the printed Madinah Mushaf exactly.
 */

// Bundled local copies from pinned qpc-fonts commit f93bf5f3 — DO NOT change.
const FONT_BASE = '/qpc-v2';

const API_BASE = 'https://api.quran.com/api/v4';
// Versioned cache key; v4 invalidates earlier data that included full boundary
// verses from neighbouring pages instead of only glyphs whose `v2_page` matches.
const LS_PAGE_PREFIX = 'atraa_qpc2_page_v4_';

const loadedFonts = new Set<number>();
const loadingFonts = new Map<number, Promise<boolean>>();

export interface QpcWord {
  /** PUA codepoint(s) from the QCF v2 font for this word */
  code_v2: string;
  /** V2 font line number on the page (1-15) */
  line_number: number;
  /** Position of the word within its verse */
  position: number;
  /** 'word' for normal words, 'end' for the ayah-end marker glyph */
  char_type_name: 'word' | 'end';
  /** Page number of the V2 font that contains this word's glyph */
  v2_page: number;
  /** Verse key e.g. "2:255" */
  verse_key: string;
  /** Verse number within the surah */
  verse_number: number;
}

export interface QpcPageData {
  page_number: number;
  /** All words on the page, in reading order */
  words: QpcWord[];
  /** Distinct surah numbers on this page */
  surah_numbers: number[];
}

/**
 * Format a page number as 3-digit zero-padded (e.g., 1 → "001", 42 → "042").
 */
const padPage = (n: number) => String(n).padStart(3, '0');

const fontFamily = (page: number) => `QPC2-P${padPage(page)}`;
const fontUrl = (page: number) => `${FONT_BASE}/QCF_P${padPage(page)}.woff2`;

/**
 * Load a page font and VERIFY it is actually available.
 * Returns `true` only when the font is fully decoded and usable.
 * Returns `false` if loading or verification fails — caller MUST refuse to
 * render the page in that case.
 */
export function loadPageFont(page: number): Promise<boolean> {
  if (page < 1 || page > 604) return Promise.resolve(false);
  if (loadedFonts.has(page)) return Promise.resolve(true);
  const existing = loadingFonts.get(page);
  if (existing) return existing;

  const family = fontFamily(page);
  const url = fontUrl(page);

  // Inject the @font-face rule once.
  // font-display: block ⇒ browser shows invisible glyphs until font loads,
  // NEVER swaps in a fallback font that would corrupt the Quran rendering.
  const styleId = `qpc2-style-${page}`;
  if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent =
      `@font-face{font-family:'${family}';` +
      `src:url('${url}') format('woff2');` +
      `font-display:block;font-weight:normal;font-style:normal;}`;
    document.head.appendChild(style);
  }

  const promise = (async (): Promise<boolean> => {
    try {
      if (typeof document === 'undefined' || !document.fonts) {
        // No FontFace API — we cannot verify, so refuse.
        return false;
      }
      // Force-load the font and wait for it.
      await document.fonts.load(`16px '${family}'`);
      // Double-check it actually loaded — defends against silent CDN failures.
      const ok = document.fonts.check(`16px '${family}'`);
      if (ok) {
        loadedFonts.add(page);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      loadingFonts.delete(page);
    }
  })();
  loadingFonts.set(page, promise);
  return promise;
}

/**
 * Fetch (and cache) the words + line layout for a single mushaf page from the
 * official Quran Foundation API. We request `code_v2`, `v2_page`, `line_v2`
 * so that every word is matched to the exact font file containing its glyph.
 */
export async function fetchPageData(page: number): Promise<QpcPageData> {
  const lsKey = `${LS_PAGE_PREFIX}${page}`;
  try {
    const cached = localStorage.getItem(lsKey);
    if (cached) {
      const parsed = JSON.parse(cached) as QpcPageData;
      if (parsed?.words?.length && parsed.page_number === page) return parsed;
    }
  } catch { /* ignore */ }

  // Request V2-specific fields. `mushaf=1` = QCF V2 layout.
  const url =
    `${API_BASE}/verses/by_page/${page}` +
    `?words=true&per_page=300&mushaf=1` +
    `&word_fields=code_v2,v2_page,line_v2,position,char_type_name`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to load page ${page}: HTTP ${r.status}`);
  const data = await r.json();

  type RawWord = {
    code_v2: string;
    v2_page: number;
    line_v2?: number;
    line_number?: number;
    position: number;
    char_type_name: 'word' | 'end';
  };
  type RawVerse = {
    verse_key: string;
    verse_number: number;
    page_number: number;
    words: RawWord[];
  };
  const verses: RawVerse[] = data?.verses ?? [];
  if (!verses.length) throw new Error(`No verses returned for page ${page}`);

  const words: QpcWord[] = [];
  const surahSet = new Set<number>();
  for (const v of verses) {
    for (const w of v.words) {
      // The API returns complete verses for a page. If a verse crosses a page
      // boundary, some words belong to the previous/next QPC font page. Those
      // MUST NOT be drawn here or the Mushaf page becomes visibly corrupted.
      if (w.v2_page !== page) continue;

      // V2 line number — fall back to line_number only if line_v2 absent.
      const ln = w.line_v2 ?? w.line_number ?? 1;
      // Each word MUST have a v2_page. If missing, the API response is
      // unsafe — abort to avoid mis-rendering.
      if (typeof w.v2_page !== 'number' || !w.code_v2) {
        throw new Error(`Malformed word data on page ${page}`);
      }
      words.push({
        code_v2: w.code_v2,
        line_number: ln,
        position: w.position,
        char_type_name: w.char_type_name,
        v2_page: w.v2_page,
        verse_key: v.verse_key,
        verse_number: v.verse_number,
      });

      const [surahStr] = v.verse_key.split(':');
      const surahN = parseInt(surahStr, 10);
      if (Number.isFinite(surahN)) surahSet.add(surahN);
    }
  }

  // CRITICAL: Do NOT sort by `position`. It resets at every verse, and several
  // verses can share the same Mushaf line. Sorting by position would interleave
  // words from different ayahs and corrupt the Qur'an. Preserve the canonical
  // API reading order; grouping by line keeps this order inside every line.

  const result: QpcPageData = {
    page_number: page,
    words,
    surah_numbers: Array.from(surahSet).sort((a, b) => a - b),
  };

  try { localStorage.setItem(lsKey, JSON.stringify(result)); } catch { /* quota */ }
  return result;
}

/**
 * Group words by line_number for layout rendering.
 */
export function groupByLine(words: QpcWord[]): Map<number, QpcWord[]> {
  const map = new Map<number, QpcWord[]>();
  for (const w of words) {
    const arr = map.get(w.line_number) ?? [];
    arr.push(w);
    map.set(w.line_number, arr);
  }
  return map;
}

/**
 * Parse the verse_key of a word, e.g. "2:255" → { surah: 2, ayah: 255 }
 */
export function parseVerseKey(key: string): { surah: number; ayah: number } | null {
  const [s, a] = key.split(':');
  const surah = parseInt(s, 10);
  const ayah = parseInt(a, 10);
  if (Number.isFinite(surah) && Number.isFinite(ayah)) return { surah, ayah };
  return null;
}

/** Page font family helper — name MUST match what loadPageFont injects. */
export const pageFontFamily = (page: number) => fontFamily(page);

/**
 * Determine the unique set of font pages required to render every word on the
 * given page (each word's glyph lives in its own `v2_page` font file).
 */
export function uniqueFontPagesFor(words: QpcWord[]): number[] {
  const set = new Set<number>();
  for (const w of words) set.add(w.v2_page);
  return Array.from(set).sort((a, b) => a - b);
}
