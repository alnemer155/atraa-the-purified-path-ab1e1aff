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
  {
    id: 'pillars',
    question: 'كم عدد أركان الإسلام؟',
    options: ['ثلاثة', 'خمسة', 'سبعة', 'عشرة'],
    answer: 1,
  },
  {
    id: 'qibla',
    question: 'ما اتجاه القبلة في الصلاة؟',
    options: ['القدس', 'المدينة المنورة', 'مكة المكرمة (الكعبة)', 'النجف'],
    answer: 2,
  },
  {
    id: 'fajr',
    question: 'كم عدد ركعات صلاة الفجر؟',
    options: ['ركعة واحدة', 'ركعتان', 'ثلاث ركعات', 'أربع ركعات'],
    answer: 1,
  },
  {
    id: 'ramadan',
    question: 'ما الشهر الذي يُصام فيه فرضاً؟',
    options: ['شعبان', 'رجب', 'رمضان', 'ذو الحجة'],
    answer: 2,
  },
  {
    id: 'quran',
    question: 'كم عدد سور القرآن الكريم؟',
    options: ['٩٩', '١١٤', '١٢٠', '١٣٠'],
    answer: 1,
  },
];

/** Pick 3 random questions from the bank. */
export const pickSwitchQuestions = (count = 3): SwitchQuestion[] => {
  const arr = [...MADHHAB_SWITCH_QUESTIONS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
};
