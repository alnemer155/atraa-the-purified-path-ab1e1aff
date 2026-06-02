ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS quran_paused boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS quran_resume_at timestamptz DEFAULT '2026-08-02T00:00:00Z',
  ADD COLUMN IF NOT EXISTS quran_pause_message text NOT NULL DEFAULT 'القرآن الكريم في فترة صيانة وتحسين، وسيعود تلقائياً للجميع.';

UPDATE public.site_settings
SET quran_paused = true,
    quran_resume_at = '2026-08-02T00:00:00Z'
WHERE id = 'global';

INSERT INTO public.site_settings (id, quran_paused, quran_resume_at)
VALUES ('global', true, '2026-08-02T00:00:00Z')
ON CONFLICT (id) DO NOTHING;