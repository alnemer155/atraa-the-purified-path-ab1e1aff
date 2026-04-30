-- Admin-managed duas/ziyarat/adhkar (shown only on admin.atraa.xyz)
CREATE TABLE public.admin_duas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('dua','ziyara','dhikr')),
  sect TEXT NOT NULL CHECK (sect IN ('shia','sunni')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_duas ENABLE ROW LEVEL SECURITY;

-- Public read so the admin page (no auth, gated by PIN client-side) can list them.
CREATE POLICY "admin_duas readable by anyone"
  ON public.admin_duas FOR SELECT USING (true);

CREATE POLICY "admin_duas insert by anyone"
  ON public.admin_duas FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_duas update by anyone"
  ON public.admin_duas FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "admin_duas delete by anyone"
  ON public.admin_duas FOR DELETE USING (true);

CREATE TRIGGER admin_duas_updated_at
  BEFORE UPDATE ON public.admin_duas
  FOR EACH ROW EXECUTE FUNCTION public.update_khatma_updated_at();

-- Admin-managed wallpapers (image stored in Supabase Storage)
CREATE TABLE public.admin_wallpapers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_wallpapers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_wallpapers readable by anyone"
  ON public.admin_wallpapers FOR SELECT USING (true);
CREATE POLICY "admin_wallpapers insert by anyone"
  ON public.admin_wallpapers FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_wallpapers delete by anyone"
  ON public.admin_wallpapers FOR DELETE USING (true);

-- Public storage bucket for wallpapers
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-wallpapers', 'admin-wallpapers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "admin-wallpapers public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'admin-wallpapers');

CREATE POLICY "admin-wallpapers public upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'admin-wallpapers');

CREATE POLICY "admin-wallpapers public delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'admin-wallpapers');