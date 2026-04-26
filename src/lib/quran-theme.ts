/**
 * Quran reading theme — controls the in-reader color palette without
 * affecting the rest of the app. The chosen value is applied as a
 * `data-quran-theme` attribute on the reader root, scoping the CSS
 * tokens defined in `index.css`.
 *
 *   default → inherits the global app theme (light or dark)
 *   sepia   → warm, low-glare paper tone
 *   night   → pure-black ink-on-paper for very dark rooms
 */

import { useEffect, useState } from 'react';

export type QuranTheme = 'default' | 'sepia' | 'night';

const KEY = 'atraa_quran_theme_v1';

export const getStoredQuranTheme = (): QuranTheme => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'sepia' || v === 'night' ? v : 'default';
  } catch { return 'default'; }
};

export const setStoredQuranTheme = (t: QuranTheme): void => {
  try { localStorage.setItem(KEY, t); } catch { /* ignore */ }
};

/** Reactive hook — returns [theme, setTheme]. Persists to localStorage. */
export function useQuranTheme(): [QuranTheme, (t: QuranTheme) => void] {
  const [theme, setThemeState] = useState<QuranTheme>(getStoredQuranTheme);
  useEffect(() => { setStoredQuranTheme(theme); }, [theme]);
  return [theme, setThemeState];
}
