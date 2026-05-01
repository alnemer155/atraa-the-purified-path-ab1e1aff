/**
 * Reading theme — applies app-wide via a `data-quran-theme` attribute on
 * the <html> element. Three options:
 *
 *   default → inherits the global app theme tokens defined in :root
 *   sepia   → warm, low-glare paper tone
 *   night   → pure-black ink-on-paper for very dark rooms
 *
 * Originally scoped to the Quran reader; now exposed globally so the user
 * can pick the mood from Settings (alongside the language switcher).
 */

import { useEffect, useState } from 'react';

export type QuranTheme = 'default' | 'sepia' | 'night';

const KEY = 'atraa_quran_theme_v1';
const SEED_KEY = 'atraa_quran_theme_seeded_v1';
const EVENT = 'atraa:reading-theme-changed';

/**
 * First-run default = sepia (warm, low-glare). Users may override at any time;
 * once a value (including 'default') has been set explicitly, we never reseed.
 */
export const getStoredQuranTheme = (): QuranTheme => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'sepia' || v === 'night' || v === 'default') return v;
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

/** Reactive hook — returns [theme, setTheme]. Persists + applies globally. */
export function useQuranTheme(): [QuranTheme, (t: QuranTheme) => void] {
  const [theme, setThemeState] = useState<QuranTheme>(getStoredQuranTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
    try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  // Sync across tabs / other components
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
