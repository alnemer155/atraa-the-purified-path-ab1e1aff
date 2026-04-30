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
const EVENT = 'atraa:reading-theme-changed';

export const getStoredQuranTheme = (): QuranTheme => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'sepia' || v === 'night' ? v : 'default';
  } catch { return 'default'; }
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
