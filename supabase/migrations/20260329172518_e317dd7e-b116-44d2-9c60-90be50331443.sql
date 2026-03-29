CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  notification_types JSONB DEFAULT '["adhan","dhikr","salawat","quiz","dua"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert push subscriptions"
ON public.push_subscriptions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update their push subscriptions"
ON public.push_subscriptions FOR UPDATE
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can select push subscriptions"
ON public.push_subscriptions FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can delete their push subscriptions"
ON public.push_subscriptions FOR DELETE
TO anon, authenticated
USING (true);