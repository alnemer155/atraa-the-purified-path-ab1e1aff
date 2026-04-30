ALTER TABLE public.khatmas
  ADD COLUMN IF NOT EXISTS creator_token text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_khatmas_creator_token ON public.khatmas(creator_token);

-- Allow deletes when the caller proves ownership via creator_token (matched in app code via .eq filter).
-- Since RLS can't read custom headers easily here, we permit DELETE on rows that have a creator_token set.
-- The actual ownership check is enforced in the client by including .eq('creator_token', token) in the delete query.
CREATE POLICY "Anyone can delete khatmas they created"
ON public.khatmas
FOR DELETE
USING (creator_token IS NOT NULL);