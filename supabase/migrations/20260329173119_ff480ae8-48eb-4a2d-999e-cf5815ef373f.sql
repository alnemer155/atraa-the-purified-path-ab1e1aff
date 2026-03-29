CREATE TABLE public.email_notification_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  device_id TEXT NOT NULL,
  adhan BOOLEAN DEFAULT false,
  dhikr BOOLEAN DEFAULT false,
  salawat BOOLEAN DEFAULT false,
  quiz BOOLEAN DEFAULT false,
  dua BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.email_notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert email prefs" ON public.email_notification_prefs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update email prefs" ON public.email_notification_prefs FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can select email prefs" ON public.email_notification_prefs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete email prefs" ON public.email_notification_prefs FOR DELETE TO anon, authenticated USING (true);