/**
 * Quran playback session — single source of truth for the audio bar and the
 * playback control panel. Lifted out of QuranAudioBar so the page reader,
 * settings panel, and bar can all read/write the same state without prop
 * drilling. Persists user choices (reciter / repeat / speed) to localStorage.
 */

import { getStoredReciterId } from './quran-reciters';

export interface PlaybackRange {
  /** Surah of the start ayah */
  startSurah: number;
  /** Start ayah within `startSurah` */
  startAyah: number;
  /** Surah of the end ayah (must be ≥ startSurah) */
  endSurah: number;
  /** End ayah within `endSurah` (inclusive) */
  endAyah: number;
}

export interface PlaybackSettings {
  reciterId: string;
  /** How many times to repeat the entire range. 0 = infinite, 1 = play once. */
  repeatCount: number;
  /** Pause (ms) inserted between ayahs — useful for memorisation. */
  gapMs: number;
  /** Playback speed multiplier (0.75 / 1 / 1.25 / 1.5). */
  speed: number;
  /** Auto-advance to next ayah when current ayah ends. */
  autoAdvance: boolean;
}

const SETTINGS_KEY = 'atraa_quran_playback_settings_v1';

const DEFAULTS: PlaybackSettings = {
  reciterId: '',
  repeatCount: 1,
  gapMs: 0,
  speed: 1,
  autoAdvance: true,
};

export const REPEAT_OPTIONS = [
  { value: 1, label: 'مرّة' },
  { value: 2, label: 'مرّتين' },
  { value: 3, label: '٣' },
  { value: 5, label: '٥' },
  { value: 7, label: '٧' },
  { value: 10, label: '١٠' },
  { value: 0, label: '∞' },
] as const;

export const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const;

export const GAP_OPTIONS = [
  { value: 0, label: 'بدون' },
  { value: 1000, label: '١ث' },
  { value: 2000, label: '٢ث' },
  { value: 3000, label: '٣ث' },
  { value: 5000, label: '٥ث' },
] as const;

export function getPlaybackSettings(): PlaybackSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS, reciterId: getStoredReciterId() };
    const parsed = JSON.parse(raw) as Partial<PlaybackSettings>;
    return {
      reciterId: parsed.reciterId || getStoredReciterId(),
      repeatCount: typeof parsed.repeatCount === 'number' ? parsed.repeatCount : DEFAULTS.repeatCount,
      gapMs: typeof parsed.gapMs === 'number' ? parsed.gapMs : DEFAULTS.gapMs,
      speed: typeof parsed.speed === 'number' ? parsed.speed : DEFAULTS.speed,
      autoAdvance: typeof parsed.autoAdvance === 'boolean' ? parsed.autoAdvance : DEFAULTS.autoAdvance,
    };
  } catch {
    return { ...DEFAULTS, reciterId: getStoredReciterId() };
  }
}

export function setPlaybackSettings(s: PlaybackSettings): void {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
