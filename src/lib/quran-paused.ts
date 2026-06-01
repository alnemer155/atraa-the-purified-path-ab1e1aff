// Quran feature pause window.
// Per spec v2.10.15: the Quran section is paused for ~2 months and
// becomes available again automatically on the date below.

const QURAN_RESUME_AT = new Date('2026-08-01T00:00:00Z');

export const isQuranPaused = (): boolean => Date.now() < QURAN_RESUME_AT.getTime();

export const quranResumeAt = QURAN_RESUME_AT;
