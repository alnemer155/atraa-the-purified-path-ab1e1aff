-- Add fields to khatmas to support a 30-juz Quran completion
ALTER TABLE public.khatmas
  ADD COLUMN IF NOT EXISTS dedication TEXT,
  ADD COLUMN IF NOT EXISTS completed_juz_count INTEGER NOT NULL DEFAULT 0;

-- Track per-juz claims for each khatma
CREATE TABLE IF NOT EXISTS public.khatma_juz_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  khatma_id UUID NOT NULL REFERENCES public.khatmas(id) ON DELETE CASCADE,
  juz_number INTEGER NOT NULL CHECK (juz_number BETWEEN 1 AND 30),
  reader_name TEXT,
  reader_token TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (khatma_id, juz_number)
);

CREATE INDEX IF NOT EXISTS idx_khatma_juz_claims_khatma ON public.khatma_juz_claims(khatma_id);

ALTER TABLE public.khatma_juz_claims ENABLE ROW LEVEL SECURITY;

-- Anyone can view claims of a published khatma
CREATE POLICY "Claims viewable for published khatmas"
ON public.khatma_juz_claims
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.khatmas k
    WHERE k.id = khatma_juz_claims.khatma_id AND k.is_published = true
  )
);

-- Anyone can claim a juz on a published khatma
CREATE POLICY "Anyone can claim a juz on published khatmas"
ON public.khatma_juz_claims
FOR INSERT
WITH CHECK (
  reader_token IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.khatmas k
    WHERE k.id = khatma_juz_claims.khatma_id AND k.is_published = true
  )
);

-- Anyone can release (delete) a claim if they hold the reader_token
CREATE POLICY "Readers can release their own claim"
ON public.khatma_juz_claims
FOR DELETE
USING (reader_token IS NOT NULL);

-- Trigger: keep completed_juz_count in sync on khatmas
CREATE OR REPLACE FUNCTION public.sync_khatma_juz_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_id := OLD.khatma_id;
  ELSE
    target_id := NEW.khatma_id;
  END IF;

  UPDATE public.khatmas
  SET completed_juz_count = (
    SELECT COUNT(*) FROM public.khatma_juz_claims WHERE khatma_id = target_id
  ),
  updated_at = now()
  WHERE id = target_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_khatma_juz_claims_sync ON public.khatma_juz_claims;
CREATE TRIGGER trg_khatma_juz_claims_sync
AFTER INSERT OR DELETE ON public.khatma_juz_claims
FOR EACH ROW EXECUTE FUNCTION public.sync_khatma_juz_count();