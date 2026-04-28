/**
 * Prayer-time calculation method preference (v2.7.59).
 *
 * Shia users are LOCKED to method=7 (University of Tehran / Ja'fari) — this
 * matches the doctrinal Maghrib (sunset + ~4°) and Asr conventions and is
 * the only correct option for Shia jurisprudence in this app.
 *
 * Sunni users can choose from the AlAdhan API methods. Default is "auto"
 * which picks a sensible per-country method (Umm al-Qura for SA, Kuwait
 * for KW, Qatar for QA, ISNA for US/CA, MWL for EU, etc.). The picker
 * also exposes manual overrides.
 *
 * Reference: https://aladhan.com/calculation-methods
 */

export interface CalcMethod {
  id: number | 'auto';
  labelAr: string;
  labelEn: string;
  /** Where this method is most commonly used — surfaced as a hint */
  hintAr?: string;
  hintEn?: string;
}

export const SUNNI_METHODS: CalcMethod[] = [
  { id: 'auto', labelAr: 'تلقائي (بالنظام)', labelEn: 'Automatic (system)', hintAr: 'الأنسب لبلدك', hintEn: 'Best for your country' },
  { id: 4,  labelAr: 'أم القرى — مكة المكرمة', labelEn: 'Umm al-Qura, Makkah', hintAr: 'السعودية', hintEn: 'Saudi Arabia' },
  { id: 9,  labelAr: 'وزارة الأوقاف الكويتية', labelEn: 'Kuwait Ministry of Awqaf', hintAr: 'الكويت', hintEn: 'Kuwait' },
  { id: 10, labelAr: 'وزارة الأوقاف القطرية', labelEn: 'Qatar Awqaf', hintAr: 'قطر', hintEn: 'Qatar' },
  { id: 16, labelAr: 'دبي — الإمارات', labelEn: 'Dubai (UAE)', hintAr: 'الإمارات', hintEn: 'UAE' },
  { id: 8,  labelAr: 'الهيئة العامة للمساحة المصرية', labelEn: 'Egyptian General Authority', hintAr: 'مصر / إفريقيا', hintEn: 'Egypt / Africa' },
  { id: 3,  labelAr: 'رابطة العالم الإسلامي (MWL)', labelEn: 'Muslim World League', hintAr: 'أوروبا والشرق الأقصى', hintEn: 'Europe / Far East' },
  { id: 2,  labelAr: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', labelEn: 'ISNA — North America', hintAr: 'أمريكا الشمالية', hintEn: 'North America' },
  { id: 12, labelAr: 'الاتحاد الإسلامي الفرنسي (UOIF)', labelEn: 'UOIF — France', hintAr: 'فرنسا', hintEn: 'France' },
  { id: 5,  labelAr: 'الهيئة المصرية العامة للمساحة', labelEn: 'Egyptian General Authority of Survey', hintAr: 'مصر', hintEn: 'Egypt' },
  { id: 1,  labelAr: 'كراتشي — جامعة العلوم الإسلامية', labelEn: 'Karachi — Univ. of Islamic Sciences', hintAr: 'باكستان / الهند', hintEn: 'Pakistan / India' },
  { id: 11, labelAr: 'مجلس علماء إندونيسيا (MUI)', labelEn: 'Majlis Ugama Islam Singapura', hintAr: 'سنغافورة / الجوار', hintEn: 'Singapore region' },
  { id: 13, labelAr: 'ديانت — تركيا', labelEn: 'Diyanet — Turkey', hintAr: 'تركيا', hintEn: 'Turkey' },
  { id: 14, labelAr: 'هيئة المساحة الروسية', labelEn: 'Russia (Spiritual Admin.)', hintAr: 'روسيا', hintEn: 'Russia' },
];

export const SHIA_METHOD: CalcMethod = {
  id: 7,
  labelAr: 'جعفري — جامعة طهران',
  labelEn: 'Ja\'fari — University of Tehran',
  hintAr: 'الطريقة المعتمدة لأهل المذهب الجعفري',
  hintEn: 'The doctrinal method for the Ja\'fari school',
};

const STORAGE_KEY = 'atraa_calc_method';
const EVENT = 'atraa:calc-method-changed';

export type StoredMethod = number | 'auto';

/** Heuristic: pick a sensible method ID from a country code (ISO-2). */
export function methodFromCountry(cc?: string | null): number {
  const c = (cc || '').toUpperCase();
  if (c === 'SA') return 4;            // Umm al-Qura
  if (c === 'KW') return 9;            // Kuwait
  if (c === 'QA') return 10;           // Qatar
  if (c === 'AE' || c === 'OM' || c === 'BH') return 16; // Dubai
  if (c === 'EG' || c === 'SD' || c === 'LY' || c === 'TN' || c === 'DZ' || c === 'MA') return 8; // Egypt
  if (c === 'TR') return 13;           // Diyanet
  if (c === 'PK' || c === 'IN' || c === 'BD') return 1;  // Karachi
  if (c === 'US' || c === 'CA') return 2;                // ISNA
  if (c === 'FR') return 12;           // UOIF
  if (c === 'RU') return 14;
  if (c === 'SG' || c === 'MY' || c === 'ID') return 11;
  return 3;                            // Muslim World League — global default
}

export function getStoredMethod(): StoredMethod {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'auto';
    if (raw === 'auto') return 'auto';
    const n = Number(raw);
    return Number.isFinite(n) ? n : 'auto';
  } catch { return 'auto'; }
}

export function setStoredMethod(m: StoredMethod): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(m));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: m }));
  } catch { /* ignore */ }
}

/**
 * Resolve the actual numeric method to send to AlAdhan.
 * - Shia → always 7 (Ja'fari) regardless of stored preference.
 * - Sunni + 'auto' → infer from stored country code (atraa_country_code) or fall back to MWL (3).
 * - Sunni + numeric → use as-is.
 */
export function resolveMethod(madhhab: 'shia' | 'sunni'): number {
  if (madhhab === 'shia') return 7;
  const stored = getStoredMethod();
  if (stored === 'auto') {
    let cc: string | null = null;
    try { cc = localStorage.getItem('atraa_country_code'); } catch { /* ignore */ }
    return methodFromCountry(cc);
  }
  return stored;
}

export const CALC_METHOD_EVENT = EVENT;
