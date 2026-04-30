-- Add visibility (public/private) and short_code (8-char) to khatmas
ALTER TABLE public.khatmas
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS short_code TEXT;

-- Backfill short_code for existing rows (8 hex chars from id)
UPDATE public.khatmas
SET short_code = substring(replace(id::text, '-', '') from 1 for 8)
WHERE short_code IS NULL;

-- Unique index on short_code
CREATE UNIQUE INDEX IF NOT EXISTS khatmas_short_code_uidx ON public.khatmas(short_code);

-- Validate visibility values via trigger (avoid CHECK with future-time logic; here a simple enum-like check is fine but we use trigger for consistency)
CREATE OR REPLACE FUNCTION public.validate_khatma_visibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.visibility NOT IN ('public', 'private') THEN
    RAISE EXCEPTION 'Invalid khatma visibility: %', NEW.visibility;
  END IF;
  IF NEW.short_code IS NULL OR length(NEW.short_code) < 6 THEN
    RAISE EXCEPTION 'Khatma requires a short_code';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_khatma_visibility ON public.khatmas;
CREATE TRIGGER trg_validate_khatma_visibility
BEFORE INSERT OR UPDATE ON public.khatmas
FOR EACH ROW EXECUTE FUNCTION public.validate_khatma_visibility();
