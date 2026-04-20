/**
 * Helpers for replacing common Islamic textual conventions with proper symbols.
 */

// U+06DD ARABIC END OF AYAH — used to mark verse numbers in mushaf style.
export const AYAH_MARK = '\u06DD';

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Convert a number to Arabic-Indic digits (e.g. 12 → ١٢). */
export function toArabicDigits(n: number): string {
  return String(n).split('').map(ch => /[0-9]/.test(ch) ? ARABIC_DIGITS[+ch] : ch).join('');
}

/** Wrap a verse number in the Quranic end-of-ayah symbol (e.g. ۝١٢). */
export function ayahMark(n: number): string {
  return `${AYAH_MARK}${toArabicDigits(n)}`;
}

/**
 * Patterns that mean "peace be upon him/her/them" — they should be
 * replaced in rendered content by the <PeaceBeUponHim /> icon.
 *
 * IMPORTANT: We do NOT touch the Quran text or supplication texts —
 * only UI labels and metadata.
 */
export const PBUH_PATTERNS = [
  /\(عليه السلام\)/g,
  /\(عليها السلام\)/g,
  /\(عليهم السلام\)/g,
  /\(عليهما السلام\)/g,
  /عليه السلام/g,
  /عليها السلام/g,
  /عليهم السلام/g,
  /عليهما السلام/g,
];

/**
 * Splits a string into parts so the caller can render the (ع) icon
 * in place of the textual phrase. Returns an array of either
 * { type: 'text', value } or { type: 'pbuh' }.
 */
export type PbuhPart = { type: 'text'; value: string } | { type: 'pbuh' };

export function splitPbuh(input: string): PbuhPart[] {
  if (!input) return [{ type: 'text', value: '' }];
  // Combined pattern (any of the variants)
  const combined = /\((?:عليه|عليها|عليهم|عليهما) السلام\)|(?:عليه|عليها|عليهم|عليهما) السلام/g;
  const result: PbuhPart[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = combined.exec(input)) !== null) {
    if (m.index > lastIndex) {
      result.push({ type: 'text', value: input.slice(lastIndex, m.index) });
    }
    result.push({ type: 'pbuh' });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < input.length) {
    result.push({ type: 'text', value: input.slice(lastIndex) });
  }
  return result.length ? result : [{ type: 'text', value: input }];
}
