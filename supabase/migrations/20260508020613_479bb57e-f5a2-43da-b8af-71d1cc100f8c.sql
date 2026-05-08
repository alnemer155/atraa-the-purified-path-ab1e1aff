-- Add podcast support and YouTube URL support to qasaid table
ALTER TABLE public.admin_qasaid ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'qasaid';
ALTER TABLE public.admin_qasaid ADD COLUMN IF NOT EXISTS youtube_url TEXT NULL;

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_admin_qasaid_category ON public.admin_qasaid(category);
