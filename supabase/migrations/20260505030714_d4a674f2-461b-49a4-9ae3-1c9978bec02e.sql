
-- Qasida comments (anonymous, name-only)
CREATE TABLE IF NOT EXISTS public.qasida_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qasida_id uuid NOT NULL REFERENCES public.admin_qasaid(id) ON DELETE CASCADE,
  visitor_name text NOT NULL CHECK (char_length(visitor_name) BETWEEN 2 AND 50),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  visitor_token text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qasida_comments_qasida ON public.qasida_comments(qasida_id, created_at DESC);
ALTER TABLE public.qasida_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qasida_comments select all" ON public.qasida_comments FOR SELECT USING (true);
CREATE POLICY "qasida_comments insert all" ON public.qasida_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "qasida_comments delete by token" ON public.qasida_comments FOR DELETE USING (visitor_token IS NOT NULL);

-- Qasida likes (token-based, prevents duplicate)
CREATE TABLE IF NOT EXISTS public.qasida_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qasida_id uuid NOT NULL REFERENCES public.admin_qasaid(id) ON DELETE CASCADE,
  visitor_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (qasida_id, visitor_token)
);
CREATE INDEX IF NOT EXISTS idx_qasida_likes_qasida ON public.qasida_likes(qasida_id);
ALTER TABLE public.qasida_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qasida_likes select all" ON public.qasida_likes FOR SELECT USING (true);
CREATE POLICY "qasida_likes insert all" ON public.qasida_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "qasida_likes delete by token" ON public.qasida_likes FOR DELETE USING (true);

-- Khatma recitations (surah mode — name + privacy)
CREATE TABLE IF NOT EXISTS public.khatma_recitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  khatma_id uuid NOT NULL REFERENCES public.khatmas(id) ON DELETE CASCADE,
  reader_name text,
  reader_token text NOT NULL,
  is_private boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_khatma_recitations_khatma ON public.khatma_recitations(khatma_id, created_at DESC);
ALTER TABLE public.khatma_recitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "khatma_recitations select all" ON public.khatma_recitations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.khatmas k WHERE k.id = khatma_id AND k.is_published = true));
CREATE POLICY "khatma_recitations insert all" ON public.khatma_recitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.khatmas k WHERE k.id = khatma_id AND k.is_published = true)
);

-- Add is_private to juz claims
ALTER TABLE public.khatma_juz_claims
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;
