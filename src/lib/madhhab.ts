/**
 * Madhhab — v2.10.15
 *
 * The Sunni track has been fully removed from the app. This module is kept
 * as a thin shim so existing imports keep compiling; everything now resolves
 * to 'shia'.
 */

import { useState } from 'react';

export type Madhhab = 'shia';

export const getMadhhab = (): Madhhab => 'shia';

// No-op kept for backward compatibility with old call-sites.
export const setMadhhab = (_m: Madhhab): void => {
  try { localStorage.setItem('atraa_madhhab', 'shia'); } catch { /* ignore */ }
};

export const useMadhhab = (): Madhhab => {
  const [m] = useState<Madhhab>('shia');
  return m;
};

// Legacy types — no longer used at runtime but kept to avoid breaking imports.
export interface SwitchQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
}
export const MADHHAB_SWITCH_QUESTIONS: SwitchQuestion[] = [];
export const pickSwitchQuestions = (_count = 3): SwitchQuestion[] => [];
