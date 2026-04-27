/**
 * Madhhab (school of thought) preference store.
 *
 * Two values are supported app-wide:
 *   - 'shia'  → Twelver Ja'fari (default, full content library)
 *   - 'sunni' → Ahl al-Sunnah (curated authentic content from trusted sources)
 *
 * Switching between the two requires passing 3 EASY GENERAL-KNOWLEDGE Islamic
 * questions (NOT sectarian) defined in `MADHHAB_SWITCH_QUESTIONS`. This is a
 * lightweight friction step to confirm intent — not a doctrinal test.
 */

import { useEffect, useState } from 'react';

export type Madhhab = 'shia' | 'sunni';

const KEY = 'atraa_madhhab';
const EVENT = 'atraa:madhhab-changed';

export const getMadhhab = (): Madhhab => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'sunni' ? 'sunni' : 'shia';
  } catch {
    return 'shia';
  }
};

export const setMadhhab = (m: Madhhab): void => {
  try {
    localStorage.setItem(KEY, m);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: m }));
  } catch {
    /* ignore */
  }
};

/** Reactive hook — re-renders when madhhab changes from anywhere in the app. */
export const useMadhhab = (): Madhhab => {
  const [m, setM] = useState<Madhhab>(getMadhhab);
  useEffect(() => {
    const onChange = () => setM(getMadhhab());
    window.addEventListener(EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);
  return m;
};

/* ---------------------------------------------------------------------------
 * Switch verification — 3 very easy GENERAL Islamic knowledge questions.
 * No sectarian content. Used to confirm the user intentionally wants to
 * change their school after the initial onboarding choice.
 * ------------------------------------------------------------------------- */
export interface SwitchQuestion {
  id: string;
  question: string;
  options: string[];
  /** index of correct option in `options` */
  answer: number;
}

export const MADHHAB_SWITCH_QUESTIONS: SwitchQuestion[] = [
  { id: 'pillars', question: 'كم عدد أركان الإسلام؟',
    options: ['ثلاثة', 'خمسة', 'سبعة', 'عشرة'], answer: 1 },
  { id: 'qibla', question: 'ما اتجاه القبلة في الصلاة؟',
    options: ['القدس', 'المدينة المنورة', 'مكة المكرمة (الكعبة)', 'النجف'], answer: 2 },
  { id: 'fajr', question: 'كم عدد ركعات صلاة الفجر؟',
    options: ['ركعة واحدة', 'ركعتان', 'ثلاث ركعات', 'أربع ركعات'], answer: 1 },
  { id: 'ramadan', question: 'ما الشهر الذي يُصام فيه فرضاً؟',
    options: ['شعبان', 'رجب', 'رمضان', 'ذو الحجة'], answer: 2 },
  { id: 'quran-surahs', question: 'كم عدد سور القرآن الكريم؟',
    options: ['٩٩', '١١٤', '١٢٠', '١٣٠'], answer: 1 },
  { id: 'quran-juz', question: 'إلى كم جزءاً يُقسَّم القرآن الكريم؟',
    options: ['٢٠', '٢٥', '٣٠', '٦٠'], answer: 2 },
  { id: 'maghrib', question: 'كم عدد ركعات صلاة المغرب؟',
    options: ['ركعتان', 'ثلاث ركعات', 'أربع ركعات', 'خمس ركعات'], answer: 1 },
  { id: 'dhuhr', question: 'كم عدد ركعات صلاة الظهر الفريضة؟',
    options: ['ركعتان', 'ثلاث ركعات', 'أربع ركعات', 'خمس ركعات'], answer: 2 },
  { id: 'isha', question: 'كم عدد ركعات صلاة العشاء الفريضة؟',
    options: ['ركعتان', 'ثلاث ركعات', 'أربع ركعات', 'خمس ركعات'], answer: 2 },
  { id: 'hajj-place', question: 'في أي بلد تقع شعائر الحج؟',
    options: ['المملكة العربية السعودية', 'العراق', 'مصر', 'الأردن'], answer: 0 },
  { id: 'first-prophet', question: 'من هو أول الأنبياء؟',
    options: ['نوح عليه السلام', 'إبراهيم عليه السلام', 'آدم عليه السلام', 'موسى عليه السلام'], answer: 2 },
  { id: 'last-prophet', question: 'من هو خاتم الأنبياء والمرسلين؟',
    options: ['عيسى عليه السلام', 'محمد ﷺ', 'إبراهيم عليه السلام', 'موسى عليه السلام'], answer: 1 },
  { id: 'first-surah', question: 'ما أول سورة في المصحف الشريف؟',
    options: ['البقرة', 'الفاتحة', 'يس', 'الإخلاص'], answer: 1 },
  { id: 'shortest-surah', question: 'ما أقصر سورة في القرآن الكريم؟',
    options: ['الإخلاص', 'الكوثر', 'الفلق', 'الناس'], answer: 1 },
  { id: 'zakat-rate', question: 'ما المقدار الشرعي العام لزكاة المال (النقد)؟',
    options: ['١٪', '٢٫٥٪', '٥٪', '١٠٪'], answer: 1 },
  { id: 'ramadan-month', question: 'في أي شهر هجري نزل القرآن الكريم؟',
    options: ['شعبان', 'رمضان', 'شوال', 'محرم'], answer: 1 },
  { id: 'tawaf-count', question: 'كم شوطاً يُطاف حول الكعبة في طواف الحج؟',
    options: ['٣', '٥', '٧', '٩'], answer: 2 },
  { id: 'kaaba-city', question: 'في أي مدينة تقع الكعبة المشرّفة؟',
    options: ['المدينة المنورة', 'مكة المكرمة', 'الطائف', 'جدة'], answer: 1 },
];

const SHOWN_KEY = 'atraa_madhhab_switch_shown';

const readShown = (): string[] => {
  try {
    const raw = localStorage.getItem(SHOWN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const writeShown = (ids: string[]) => {
  try { localStorage.setItem(SHOWN_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
};

/**
 * Pick `count` random questions, **excluding** ones used in the previous
 * attempt so the user never sees the same set twice in a row. When the bank
 * is exhausted (rare), the history resets and we draw fresh.
 */
export const pickSwitchQuestions = (count = 3): SwitchQuestion[] => {
  let shown = readShown();
  let pool = MADHHAB_SWITCH_QUESTIONS.filter((q) => !shown.includes(q.id));
  if (pool.length < count) {
    // Reset history — pool too small to guarantee non-repeat.
    shown = [];
    pool = [...MADHHAB_SWITCH_QUESTIONS];
  }
  // Fisher–Yates shuffle.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, count);
  writeShown([...shown, ...picked.map((q) => q.id)]);
  return picked;
};
