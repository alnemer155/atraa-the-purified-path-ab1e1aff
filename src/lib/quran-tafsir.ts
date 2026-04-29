/**
 * Tafsir loader — fetches verse-by-verse classical tafsir text from the
 * open-source spa5k/tafsir-api repository (CDN-hosted JSON, no API key).
 *
 * Available tafsirs (Arabic):
 *   - ar-tafsir-ibn-kathir       → Tafsir Ibn Kathir (mukhtasar)
 *   - ar-tafsir-al-tabari        → Tafsir al-Tabari (Jami' al-Bayan)
 *   - ar-tafsir-al-saddi         → Tafsir as-Sa'di (Taysir al-Karim)
 *   - ar-tafsir-al-jalalayn      → Tafsir al-Jalalayn
 *
 * Source: https://github.com/spa5k/tafsir_api  (CC-BY redistribution OK)
 */

export type TafsirId =
  | 'ibn-kathir'
  | 'al-tabari'
  | 'al-saddi'
  | 'al-jalalayn';

export interface TafsirOption {
  id: TafsirId;
  name: string;       // Arabic display name
  author: string;     // Arabic author
  slug: string;       // spa5k repo slug
}

export const TAFSIRS: TafsirOption[] = [
  { id: 'ibn-kathir',  name: 'تفسير ابن كثير',  author: 'الإمام ابن كثير الدمشقي',          slug: 'ar-tafsir-ibn-kathir' },
  { id: 'al-tabari',   name: 'تفسير الطبري',    author: 'الإمام محمد بن جرير الطبري',        slug: 'ar-tafsir-al-tabari' },
  { id: 'al-saddi',    name: 'تفسير السعدي',    author: 'الشيخ عبد الرحمن بن ناصر السعدي',  slug: 'ar-tafsir-al-saddi' },
  { id: 'al-jalalayn', name: 'تفسير الجلالين',  author: 'الجلال المحلي والجلال السيوطي',    slug: 'ar-tafsir-al-jalalayn' },
];

const PREF_KEY = 'atraa_tafsir_pref_v1';
const MEM_CACHE = new Map<string, string>();

export const getPreferredTafsir = (): TafsirId => {
  try {
    const v = localStorage.getItem(PREF_KEY);
    if (v && TAFSIRS.some(t => t.id === v)) return v as TafsirId;
  } catch { /* ignore */ }
  return 'ibn-kathir';
};

export const setPreferredTafsir = (id: TafsirId): void => {
  try { localStorage.setItem(PREF_KEY, id); } catch { /* ignore */ }
};

const cdnUrl = (slug: string, surah: number, ayah: number) =>
  `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${slug}/${surah}/${ayah}.json`;

/**
 * Fetch a single ayah's tafsir text. Returns plain Arabic text (no HTML).
 * Throws on network error so callers can show a retry UI.
 */
export async function fetchAyahTafsir(
  tafsirId: TafsirId,
  surah: number,
  ayah: number,
): Promise<string> {
  const opt = TAFSIRS.find(t => t.id === tafsirId);
  if (!opt) throw new Error('Unknown tafsir');
  const cacheKey = `${tafsirId}:${surah}:${ayah}`;
  if (MEM_CACHE.has(cacheKey)) return MEM_CACHE.get(cacheKey)!;

  // Persistent cache (sessionStorage to keep localStorage clean)
  try {
    const cached = sessionStorage.getItem(`atraa_tafsir_${cacheKey}`);
    if (cached) {
      MEM_CACHE.set(cacheKey, cached);
      return cached;
    }
  } catch { /* ignore */ }

  const r = await fetch(cdnUrl(opt.slug, surah, ayah));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const json = await r.json();
  // spa5k schema: { ayah, surah, text, ... }
  const text: string = (json?.text || '').toString().trim();
  if (!text) throw new Error('Empty tafsir');

  MEM_CACHE.set(cacheKey, text);
  try { sessionStorage.setItem(`atraa_tafsir_${cacheKey}`, text); } catch { /* quota */ }
  return text;
}
