
-- Subscription codes (admin-only, NOT activated on main site)
CREATE TABLE IF NOT EXISTS public.subscription_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'pro',
  duration_days integer NOT NULL DEFAULT 30,
  note text,
  redeemed_at timestamptz,
  redeemed_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_codes TO authenticated;
GRANT ALL ON public.subscription_codes TO service_role;
ALTER TABLE public.subscription_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription_codes anyone select" ON public.subscription_codes FOR SELECT USING (true);
CREATE POLICY "subscription_codes anyone insert" ON public.subscription_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "subscription_codes anyone update" ON public.subscription_codes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "subscription_codes anyone delete" ON public.subscription_codes FOR DELETE USING (true);

-- Error logs captured from the client runtime
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  stack text,
  url text,
  user_agent text,
  context jsonb DEFAULT '{}'::jsonb,
  level text NOT NULL DEFAULT 'error',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.error_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.error_logs TO authenticated;
GRANT ALL ON public.error_logs TO service_role;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "error_logs anyone select" ON public.error_logs FOR SELECT USING (true);
CREATE POLICY "error_logs anyone insert" ON public.error_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "error_logs anyone update" ON public.error_logs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "error_logs anyone delete" ON public.error_logs FOR DELETE USING (true);

-- Hidden sections / pages
CREATE TABLE IF NOT EXISTS public.hidden_sections (
  id text PRIMARY KEY,
  label text NOT NULL,
  hidden boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hidden_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hidden_sections TO authenticated;
GRANT ALL ON public.hidden_sections TO service_role;
ALTER TABLE public.hidden_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hidden_sections anyone select" ON public.hidden_sections FOR SELECT USING (true);
CREATE POLICY "hidden_sections anyone insert" ON public.hidden_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "hidden_sections anyone update" ON public.hidden_sections FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "hidden_sections anyone delete" ON public.hidden_sections FOR DELETE USING (true);

-- Seed the catalog of toggleable sections so the admin has a fixed list to manage.
INSERT INTO public.hidden_sections (id, label, hidden) VALUES
  ('home_prayer_times',  'الصفحة الرئيسية — أوقات الصلاة', false),
  ('home_qibla',         'الصفحة الرئيسية — القبلة',       false),
  ('home_athar',         'الصفحة الرئيسية — أثر',          false),
  ('home_khatma',        'الصفحة الرئيسية — الختمة',       false),
  ('home_live',          'الصفحة الرئيسية — البث المباشر', false),
  ('home_wallpapers',    'الصفحة الرئيسية — الخلفيات',     false),
  ('home_daily_picks',   'الصفحة الرئيسية — مقترحات اليوم', false),
  ('page_library',       'صفحة المكتبة',                   false),
  ('page_quran',         'صفحة القرآن الكريم',             false),
  ('page_minbar',        'صفحة منبر',                      false),
  ('page_athar',         'صفحة أثر',                       false),
  ('page_khatma',        'صفحة الختمة',                    false),
  ('page_support',       'صفحة الدعم',                     false),
  ('page_tasbih',        'صفحة المسبحة',                   false)
ON CONFLICT (id) DO NOTHING;
