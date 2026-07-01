/**
 * App theme — applies via `data-quran-theme` on <html>.
 *
 * v2.11.00: night mode removed; three seasonal moods added
 *   default  → tokens from :root
 *   sepia    → warm paper (canonical Atraa)
 *   muharram → deep crimson / mourning palette for Ashura season
 *   rabee    → soft spring greens for daily use
 *   ramadan  → nightlit indigo/gold for the blessed month
 *
 * Hook name kept as `useQuranTheme` for backwards compat across the app.
 */

import { useEffect, useState } from 'react';

export type QuranTheme = 'default' | 'sepia' | 'muharram' | 'rabee' | 'ramadan';

const KEY = 'atraa_quran_theme_v1';
const SEED_KEY = 'atraa_quran_theme_seeded_v1';
const EVENT = 'atraa:reading-theme-changed';

const VALID: QuranTheme[] = ['default', 'sepia', 'muharram', 'rabee', 'ramadan'];

export const getStoredQuranTheme = (): QuranTheme => {
  try {
    const v = localStorage.getItem(KEY) as QuranTheme | null;
    if (v && VALID.includes(v)) return v;
    // migrate legacy 'night' → 'sepia'
    if (v === ('night' as unknown as QuranTheme)) {
      localStorage.setItem(KEY, 'sepia');
      return 'sepia';
    }
    const seeded = localStorage.getItem(SEED_KEY);
    if (!seeded) {
      localStorage.setItem(KEY, 'sepia');
      localStorage.setItem(SEED_KEY, '1');
      return 'sepia';
    }
    return 'default';
  } catch { return 'sepia'; }
};

export const applyThemeToDocument = (t: QuranTheme): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (t === 'default') root.removeAttribute('data-quran-theme');
  else root.setAttribute('data-quran-theme', t);
};

export const setStoredQuranTheme = (t: QuranTheme): void => {
  try {
    localStorage.setItem(KEY, t);
    applyThemeToDocument(t);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: t }));
  } catch { /* ignore */ }
};

export function useQuranTheme(): [QuranTheme, (t: QuranTheme) => void] {
  const [theme, setThemeState] = useState<QuranTheme>(getStoredQuranTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
    try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    const onChange = () => setThemeState(getStoredQuranTheme());
    window.addEventListener(EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  return [theme, setThemeState];
}
