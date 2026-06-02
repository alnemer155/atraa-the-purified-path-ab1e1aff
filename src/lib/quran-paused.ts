// Quran feature pause window — controlled from the admin panel.
// Per spec v2.10.50: paused for two full months — from 02 Jun 2026 to 02 Aug 2026.
// Defaults below act as a safety net when the database row is unreachable.

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const FALLBACK_PAUSE_AT = new Date('2026-06-02T00:00:00Z');
const FALLBACK_RESUME_AT = new Date('2026-08-02T00:00:00Z');

export interface QuranPauseState {
  paused: boolean;
  resumeAt: Date | null;
  message: string;
}

const DEFAULT: QuranPauseState = {
  paused: Date.now() >= FALLBACK_PAUSE_AT.getTime() && Date.now() < FALLBACK_RESUME_AT.getTime(),
  resumeAt: FALLBACK_RESUME_AT,
  message: 'القرآن الكريم في فترة صيانة وتحسين، وسيعود تلقائياً للجميع.',
};

// Synchronous fallback (used by non-React callers and during initial render).
export const isQuranPaused = (): boolean => {
  const now = Date.now();
  return now >= FALLBACK_PAUSE_AT.getTime() && now < FALLBACK_RESUME_AT.getTime();
};

export const quranPauseAt = FALLBACK_PAUSE_AT;
export const quranResumeAt = FALLBACK_RESUME_AT;

// Reactive hook — reflects admin changes live via realtime.
export const useQuranPause = (): QuranPauseState => {
  const [state, setState] = useState<QuranPauseState>(DEFAULT);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('quran_paused, quran_resume_at, quran_pause_message')
          .eq('id', 'global')
          .maybeSingle();
        if (cancelled || !data) return;
        const resumeAt = data.quran_resume_at ? new Date(data.quran_resume_at) : null;
        const stillPaused = !!data.quran_paused && (!resumeAt || Date.now() < resumeAt.getTime());
        setState({
          paused: stillPaused,
          resumeAt,
          message: data.quran_pause_message || DEFAULT.message,
        });
      } catch { /* ignore */ }
    })();

    const channel = supabase
      .channel('site_settings_quran')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        const row = (payload.new ?? payload.old) as {
          quran_paused?: boolean; quran_resume_at?: string | null; quran_pause_message?: string;
        } | null;
        if (!row) return;
        const resumeAt = row.quran_resume_at ? new Date(row.quran_resume_at) : null;
        const stillPaused = !!row.quran_paused && (!resumeAt || Date.now() < resumeAt.getTime());
        setState({
          paused: stillPaused,
          resumeAt,
          message: row.quran_pause_message || DEFAULT.message,
        });
      })
      .subscribe();

    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, []);

  return state;
};
