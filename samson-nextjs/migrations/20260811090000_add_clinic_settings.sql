-- Add public clinic branding and contact fields used by the Clinic Settings page.

BEGIN;

ALTER TABLE public.clinic_config
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS map_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

COMMIT;
