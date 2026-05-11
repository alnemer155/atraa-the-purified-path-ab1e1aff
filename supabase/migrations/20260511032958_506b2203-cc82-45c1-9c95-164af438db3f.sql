
-- Athar quotes: enable admin CRUD via permissive policies (matches other admin_* tables).
CREATE POLICY "athar_quotes insert by anyone" ON public.athar_quotes
  FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "athar_quotes update by anyone" ON public.athar_quotes
  FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "athar_quotes delete by anyone" ON public.athar_quotes
  FOR DELETE TO public USING (true);

-- Qasaid: 4-digit share code (random, unique).
ALTER TABLE public.admin_qasaid
  ADD COLUMN IF NOT EXISTS share_code TEXT;

CREATE OR REPLACE FUNCTION public.assign_qasida_share_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  candidate TEXT;
  attempts INT := 0;
BEGIN
  IF NEW.share_code IS NOT NULL AND length(NEW.share_code) = 4 THEN
    RETURN NEW;
  END IF;
  LOOP
    candidate := lpad((floor(random() * 10000))::int::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.admin_qasaid WHERE share_code = candidate);
    attempts := attempts + 1;
    IF attempts > 30 THEN EXIT; END IF;
  END LOOP;
  NEW.share_code := candidate;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_qasida_share_code ON public.admin_qasaid;
CREATE TRIGGER trg_qasida_share_code
  BEFORE INSERT ON public.admin_qasaid
  FOR EACH ROW EXECUTE FUNCTION public.assign_qasida_share_code();

-- Backfill existing rows.
UPDATE public.admin_qasaid q
SET share_code = lpad((floor(random() * 10000))::int::text, 4, '0')
WHERE share_code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS admin_qasaid_share_code_key
  ON public.admin_qasaid (share_code) WHERE share_code IS NOT NULL;
