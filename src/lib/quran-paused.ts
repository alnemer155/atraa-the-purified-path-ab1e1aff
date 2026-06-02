// Quran feature pause window.
// Per spec v2.10.50: paused for two full months — from 02 Jun 2026 to 02 Aug 2026
// (inclusive). After the resume date the section becomes available again automatically.

const QURAN_PAUSE_AT = new Date('2026-06-02T00:00:00Z');
const QURAN_RESUME_AT = new Date('2026-08-02T00:00:00Z');

export const isQuranPaused = (): boolean => {
  const now = Date.now();
  return now >= QURAN_PAUSE_AT.getTime() && now < QURAN_RESUME_AT.getTime();
};

export const quranPauseAt = QURAN_PAUSE_AT;
export const quranResumeAt = QURAN_RESUME_AT;
