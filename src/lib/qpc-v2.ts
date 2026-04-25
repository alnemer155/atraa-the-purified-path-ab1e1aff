/**
 * QPC V2 (Madinah Mushaf) glyph-based renderer support library.
 *
 * Each of the 604 pages of the Madinah Mushaf has its own dedicated font that
 * contains the glyphs for the words on that exact page. The Quran.com API
 * (api.quran.com/api/v4) returns each word's `code_v2` (a single PUA codepoint)
 * along with the word's `line_number`. Rendering the codepoint with the correct
 * page font reproduces the exact layout of the printed mushaf — line breaks,
 * justification, ayah markers, and decorative glyphs included.
 *
 * Fonts are loaded lazily on demand from jsDelivr (cached by browser & PWA SW)
 * to avoid bundling ~93MB of font data into the application.
 */

const FONT_CDN =
  'https://cdn.jsdelivr.net/gh/quran/quran.com-frontend-next@production/public/fonts/quran/hafs/v2/woff2';

const API_BASE = 'https://api.quran.com/api/v4';

const LS_PAGE_PREFIX = 'atraa_qpc2_page_';

const loadedFonts = new Set<number>();
const loadingFonts = new Map<number, Promise<void>>();

export interface QpcWord {
  code_v2: string;
  line_number: number;
  position: number;
  /** 'word' for normal words, 'end' for the ayah-end marker glyph */
  char_type_name: 'word' | 'end';
  /** Verse key e.g. "2:255" — only set when we attach it from the verse */
  verse_key?: string;
  /** Verse number within the surah — for end markers */
  verse_number?: number;
}

export interface QpcPageData {
  page_number: number;
  /** All words on the page, in reading order */
  words: QpcWord[];
  /** Distinct surah numbers on this page (for header) */
  surah_numbers: number[];
  /** Map of line_number → header info if a surah starts on that line */
  surah_header_lines?: Record<number, { number: number; name: string; verses: number; revelation: 'Meccan' | 'Medinan' }>;
  /** Whether this page should display Bismillah header (after a surah-name line) */
  bismillah_lines?: number[];
}

/**
 * Inject @font-face for a given mushaf page font (idempotent).
 * Resolves once the font is fully loaded into the browser font cache.
 */
export function loadPageFont(page: number): Promise<void> {
  if (loadedFonts.has(page)) return Promise.resolve();
  const existing = loadingFonts.get(page);
  if (existing) return existing;

  const family = `QPC2-P${page}`;
  const url = `${FONT_CDN}/p${page}.woff2`;

  // Inject the @font-face rule once
  const styleId = `qpc2-style-${page}`;
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `@font-face{font-family:'${family}';src:url('${url}') format('woff2');font-display:block;}`;
    document.head.appendChild(style);
  }

  // Use FontFace API where available for accurate readiness signal.
  const promise = (async () => {
    try {
      if (typeof (document as Document & { fonts?: { load: (s: string) => Promise<unknown> } }).fonts !== 'undefined') {
        await (document as unknown as { fonts: { load: (s: string) => Promise<unknown> } }).fonts.load(`16px '${family}'`);
      }
    } catch {
      /* ignore — fall back to font-display behavior */
    } finally {
      loadedFonts.add(page);
      loadingFonts.delete(page);
    }
  })();
  loadingFonts.set(page, promise);
  return promise;
}

/**
 * Fetch (and cache) the words + line layout for a single mushaf page.
 * Cached in localStorage so subsequent loads are instant + offline-friendly.
 */
export async function fetchPageData(page: number): Promise<QpcPageData> {
  const lsKey = `${LS_PAGE_PREFIX}${page}`;
  try {
    const cached = localStorage.getItem(lsKey);
    if (cached) {
      const parsed = JSON.parse(cached) as QpcPageData;
      if (parsed?.words?.length) return parsed;
    }
  } catch { /* ignore */ }

  const url = `${API_BASE}/verses/by_page/${page}?words=true&per_page=300&word_fields=code_v2,line_number,position,page_number,char_type_name`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to load page ${page}`);
  const data = await r.json();
  type RawWord = {
    code_v2: string;
    line_number: number;
    position: number;
    char_type_name: 'word' | 'end';
  };
  type RawVerse = {
    verse_key: string;
    verse_number: number;
    page_number: number;
    words: RawWord[];
  };
  const verses: RawVerse[] = data.verses ?? [];

  const words: QpcWord[] = [];
  const surahSet = new Set<number>();
  for (const v of verses) {
    const [surahStr] = v.verse_key.split(':');
    const surahN = parseInt(surahStr, 10);
    surahSet.add(surahN);
    for (const w of v.words) {
      words.push({
        code_v2: w.code_v2,
        line_number: w.line_number,
        position: w.position,
        char_type_name: w.char_type_name,
        verse_key: v.verse_key,
        verse_number: v.verse_number,
      });
    }
  }

  // Sort by line then position for safety
  words.sort((a, b) => a.line_number - b.line_number || a.position - b.position);

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

/** Check if a given verse is the very first ayah of a surah */
export function isFirstAyahOfSurah(verseKey: string): boolean {
  return verseKey.endsWith(':1');
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

/** Page font family helper */
export const pageFontFamily = (page: number) => `QPC2-P${page}`;
