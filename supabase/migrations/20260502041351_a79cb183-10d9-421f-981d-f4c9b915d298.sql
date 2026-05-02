-- Qasaid (Husayni elegies) — admin-managed
CREATE TABLE IF NOT EXISTS public.admin_qasaid (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  reciter TEXT NOT NULL,
  details TEXT,
  duration_seconds INTEGER,
  cover_path TEXT,
  audio_path TEXT,
  video_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_qasaid ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_qasaid readable by anyone"
  ON public.admin_qasaid FOR SELECT USING (true);
CREATE POLICY "admin_qasaid insert by anyone"
  ON public.admin_qasaid FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_qasaid update by anyone"
  ON public.admin_qasaid FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "admin_qasaid delete by anyone"
  ON public.admin_qasaid FOR DELETE USING (true);

CREATE TRIGGER update_admin_qasaid_updated_at
  BEFORE UPDATE ON public.admin_qasaid
  FOR EACH ROW EXECUTE FUNCTION public.update_khatma_updated_at();

-- Storage bucket for qasaid media (cover + audio + video)
INSERT INTO storage.buckets (id, name, public)
VALUES ('qasaid-media', 'qasaid-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "qasaid-media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'qasaid-media');
CREATE POLICY "qasaid-media public insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'qasaid-media');
CREATE POLICY "qasaid-media public delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'qasaid-media');
CREATE POLICY "qasaid-media public update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'qasaid-media') WITH CHECK (bucket_id = 'qasaid-media');