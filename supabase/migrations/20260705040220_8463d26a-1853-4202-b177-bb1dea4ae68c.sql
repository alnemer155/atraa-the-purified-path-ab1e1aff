
-- Lock down admin write access; keep public reads for public content
DROP POLICY IF EXISTS "admin_duas delete by anyone" ON public.admin_duas;
DROP POLICY IF EXISTS "admin_duas insert by anyone" ON public.admin_duas;
DROP POLICY IF EXISTS "admin_duas update by anyone" ON public.admin_duas;

DROP POLICY IF EXISTS "admin_qasaid delete by anyone" ON public.admin_qasaid;
DROP POLICY IF EXISTS "admin_qasaid insert by anyone" ON public.admin_qasaid;
DROP POLICY IF EXISTS "admin_qasaid update by anyone" ON public.admin_qasaid;

DROP POLICY IF EXISTS "admin_wallpapers delete by anyone" ON public.admin_wallpapers;
DROP POLICY IF EXISTS "admin_wallpapers insert by anyone" ON public.admin_wallpapers;
DROP POLICY IF EXISTS "admin_wallpapers update by anyone" ON public.admin_wallpapers;

DROP POLICY IF EXISTS "athar_quotes delete by anyone" ON public.athar_quotes;
DROP POLICY IF EXISTS "athar_quotes insert by anyone" ON public.athar_quotes;
DROP POLICY IF EXISTS "athar_quotes update by anyone" ON public.athar_quotes;

-- error_logs: keep public INSERT for client crash reporting, restrict everything else
DROP POLICY IF EXISTS "error_logs anyone select" ON public.error_logs;
DROP POLICY IF EXISTS "error_logs anyone update" ON public.error_logs;
DROP POLICY IF EXISTS "error_logs anyone delete" ON public.error_logs;

-- hidden_sections and site_settings: keep public read, lock down writes
DROP POLICY IF EXISTS "hidden_sections anyone delete" ON public.hidden_sections;
DROP POLICY IF EXISTS "hidden_sections anyone insert" ON public.hidden_sections;
DROP POLICY IF EXISTS "hidden_sections anyone update" ON public.hidden_sections;

DROP POLICY IF EXISTS "site_settings insert by anyone" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings update by anyone" ON public.site_settings;

-- subscription_codes: fully lock down; only service_role should touch these
DROP POLICY IF EXISTS "subscription_codes anyone select" ON public.subscription_codes;
DROP POLICY IF EXISTS "subscription_codes anyone insert" ON public.subscription_codes;
DROP POLICY IF EXISTS "subscription_codes anyone update" ON public.subscription_codes;
DROP POLICY IF EXISTS "subscription_codes anyone delete" ON public.subscription_codes;

-- invoices: restrict SELECT to the invoice owner
DROP POLICY IF EXISTS "Invoices are viewable by anyone with the link" ON public.invoices;
CREATE POLICY "Users can view their own invoices"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Weak-token DELETE policies: remove client-side deletes; require service_role/edge function
DROP POLICY IF EXISTS "Anyone can delete khatmas they created" ON public.khatmas;
DROP POLICY IF EXISTS "Readers can release their own claim" ON public.khatma_juz_claims;
DROP POLICY IF EXISTS "qasida_comments delete by token" ON public.qasida_comments;

-- khatma_recitations: honour is_private flag
DROP POLICY IF EXISTS "khatma_recitations select all" ON public.khatma_recitations;
CREATE POLICY "khatma_recitations select public non-private"
  ON public.khatma_recitations
  FOR SELECT
  USING (
    COALESCE(is_private, false) = false
    AND EXISTS (
      SELECT 1 FROM public.khatmas k
      WHERE k.id = khatma_recitations.khatma_id AND k.is_published = true
    )
  );

-- SECURITY DEFINER trigger function should not be callable from PostgREST
REVOKE EXECUTE ON FUNCTION public.sync_khatma_juz_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_khatma_juz_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_khatma_juz_count() FROM authenticated;

-- Storage buckets: remove overly-broad SELECT (allows listing) and public writes.
-- Public buckets still serve individual files via their public URL; only listing
-- and anonymous writes are removed.
DROP POLICY IF EXISTS "admin-wallpapers public read" ON storage.objects;
DROP POLICY IF EXISTS "admin-wallpapers public upload" ON storage.objects;
DROP POLICY IF EXISTS "admin-wallpapers public delete" ON storage.objects;
DROP POLICY IF EXISTS "qasaid-media public read" ON storage.objects;
DROP POLICY IF EXISTS "qasaid-media public insert" ON storage.objects;
DROP POLICY IF EXISTS "qasaid-media public update" ON storage.objects;
DROP POLICY IF EXISTS "qasaid-media public delete" ON storage.objects;
