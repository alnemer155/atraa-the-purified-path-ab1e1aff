-- Invoices table for Atraa support contributions
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT,
  customer_name TEXT,
  paddle_transaction_id TEXT UNIQUE,
  paddle_customer_id TEXT,
  price_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  display_amount_sar INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  environment TEXT NOT NULL DEFAULT 'sandbox',
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_paddle_transaction ON public.invoices(paddle_transaction_id);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Anyone can view an invoice by its UUID (public receipt link)
CREATE POLICY "Invoices are viewable by anyone with the link"
  ON public.invoices FOR SELECT
  USING (true);

-- Only service role can insert/update (via webhook)
CREATE POLICY "Service role can manage invoices"
  ON public.invoices FOR ALL
  USING (auth.role() = 'service_role');

-- Sequence for human-readable invoice numbers
CREATE SEQUENCE public.invoice_number_seq START 1000;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
  year_part TEXT;
BEGIN
  next_num := nextval('public.invoice_number_seq');
  year_part := to_char(now(), 'YY');
  RETURN 'ATR-' || year_part || '-' || lpad(next_num::TEXT, 6, '0');
END;
$$;

-- Trigger to auto-set invoice_number and updated_at
CREATE OR REPLACE FUNCTION public.set_invoice_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := public.generate_invoice_number();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invoices_defaults
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invoice_defaults();