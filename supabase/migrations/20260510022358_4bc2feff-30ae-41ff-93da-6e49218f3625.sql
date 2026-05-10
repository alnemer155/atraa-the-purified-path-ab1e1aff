CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.athar_quotes (
  id text PRIMARY KEY,
  text text NOT NULL,
  sayer text NOT NULL,
  sayer_info text,
  source text,
  interpretation text,
  sect text NOT NULL DEFAULT 'both',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT athar_quotes_sect_check CHECK (sect IN ('shia','sunni','both')),
  CONSTRAINT athar_quotes_id_format CHECK (id ~ '^[A-Za-z0-9]{7}$')
);

ALTER TABLE public.athar_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athar quotes are public to read"
ON public.athar_quotes FOR SELECT USING (true);

CREATE INDEX idx_athar_quotes_sect ON public.athar_quotes(sect);
CREATE INDEX idx_athar_quotes_created_at ON public.athar_quotes(created_at DESC);

CREATE TRIGGER trg_athar_quotes_updated_at
BEFORE UPDATE ON public.athar_quotes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();