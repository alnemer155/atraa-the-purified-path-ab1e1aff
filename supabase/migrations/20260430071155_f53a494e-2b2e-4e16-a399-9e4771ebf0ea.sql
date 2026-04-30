-- Khatmas (Quran completion dedications) table
CREATE TABLE public.khatmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  title TEXT NOT NULL,
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  surah_name TEXT NOT NULL,
  recitations_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_khatmas_slug ON public.khatmas(slug);
CREATE INDEX idx_khatmas_published ON public.khatmas(is_published, created_at DESC);

ALTER TABLE public.khatmas ENABLE ROW LEVEL SECURITY;

-- Anyone can view published khatmas
CREATE POLICY "Published khatmas are viewable by anyone"
ON public.khatmas FOR SELECT
USING (is_published = true);

-- Anyone can create a khatma (no auth required, validation happens via edge function)
CREATE POLICY "Anyone can create khatmas"
ON public.khatmas FOR INSERT
WITH CHECK (true);

-- Anyone can increment recitations_count by updating the row
CREATE POLICY "Anyone can update recitations on published khatmas"
ON public.khatmas FOR UPDATE
USING (is_published = true)
WITH CHECK (is_published = true);

-- Auto update timestamp
CREATE OR REPLACE FUNCTION public.update_khatma_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_khatmas_updated_at
BEFORE UPDATE ON public.khatmas
FOR EACH ROW EXECUTE FUNCTION public.update_khatma_updated_at();