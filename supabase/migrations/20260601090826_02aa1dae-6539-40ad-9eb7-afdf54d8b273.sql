CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  maintenance_active BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT NOT NULL DEFAULT 'الموقع تحت الصيانة حالياً، نعتذر عن الإزعاج.',
  maintenance_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 'global')
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings readable by anyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings insert by anyone" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "site_settings update by anyone" ON public.site_settings FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO public.site_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER site_settings_set_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();