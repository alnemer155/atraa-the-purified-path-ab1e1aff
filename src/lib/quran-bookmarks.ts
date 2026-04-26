/**
 * Colored ayah markers — user taps an ayah medallion in the Mushaf reader
 * and assigns one of 4 colors (red / yellow / green / blue) as a personal
 * highlight. Stored locally so highlights survive across sessions and the
 * user owns their data 100% (no backend round-trip).
 *
 * Storage key:  atraa_quran_color_marks_v1
 * Shape:        { "<surah>:<ayah>": "red" | "yellow" | "green" | "blue" }
 */

export type AyahColor = 'red' | 'yellow' | 'green' | 'blue';

const STORAGE_KEY = 'atraa_quran_color_marks_v1';

/** HSL design tokens used to render the medallion + ring around a marked ayah. */
export const AYAH_COLOR_TOKENS: Record<AyahColor, { ring: string; bg: string; text: string; labelAr: string }> = {
  red:    { ring: '0 78% 52%',    bg: '0 78% 52%',    text: '0 0% 100%',  labelAr: 'أحمر' },
  yellow: { ring: '42 92% 50%',   bg: '42 92% 50%',   text: '40 35% 14%', labelAr: 'أصفر' },
  green:  { ring: '152 58% 38%',  bg: '152 58% 38%',  text: '0 0% 100%',  labelAr: 'أخضر' },
  blue:   { ring: '212 78% 48%',  bg: '212 78% 48%',  text: '0 0% 100%',  labelAr: 'أزرق' },
};

export const AYAH_COLOR_ORDER: AyahColor[] = ['red', 'yellow', 'green', 'blue'];

type ColorMap = Record<string, AyahColor>;

const keyOf = (surah: number, ayah: number) => `${surah}:${ayah}`;

let _cache: ColorMap | null = null;

const readAll = (): ColorMap => {
  if (_cache) return _cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    _cache = raw ? (JSON.parse(raw) as ColorMap) : {};
  } catch {
    _cache = {};
  }
  return _cache!;
};

const writeAll = (map: ColorMap) => {
  _cache = map;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch { /* quota */ }
  // Notify listeners in this tab — `storage` event only fires across tabs.
  try { window.dispatchEvent(new CustomEvent('atraa:ayah-marks-changed')); } catch { /* ignore */ }
};

export function getAyahColor(surah: number, ayah: number): AyahColor | null {
  return readAll()[keyOf(surah, ayah)] ?? null;
}

export function setAyahColor(surah: number, ayah: number, color: AyahColor): void {
  const map = { ...readAll() };
  map[keyOf(surah, ayah)] = color;
  writeAll(map);
}

export function clearAyahColor(surah: number, ayah: number): void {
  const map = { ...readAll() };
  delete map[keyOf(surah, ayah)];
  writeAll(map);
}

export function getAllAyahColors(): ColorMap {
  return { ...readAll() };
}
