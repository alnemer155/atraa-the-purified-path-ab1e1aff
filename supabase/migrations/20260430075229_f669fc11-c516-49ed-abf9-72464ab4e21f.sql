-- Add khatma mode (surah or full_quran)
ALTER TABLE public.khatmas
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'surah';

ALTER TABLE public.khatmas
  ALTER COLUMN surah_number DROP NOT NULL,
  ALTER COLUMN surah_name DROP NOT NULL;

-- Validate mode values via trigger (CHECK constraints discouraged for app rules)
CREATE OR REPLACE FUNCTION public.validate_khatma_mode()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.mode NOT IN ('surah', 'full_quran') THEN
    RAISE EXCEPTION 'Invalid khatma mode: %', NEW.mode;
  END IF;
  IF NEW.mode = 'surah' AND (NEW.surah_number IS NULL OR NEW.surah_name IS NULL) THEN
    RAISE EXCEPTION 'Surah-mode khatma requires surah_number and surah_name';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_khatma_mode ON public.khatmas;
CREATE TRIGGER trg_validate_khatma_mode
BEFORE INSERT OR UPDATE ON public.khatmas
FOR EACH ROW EXECUTE FUNCTION public.validate_khatma_mode();