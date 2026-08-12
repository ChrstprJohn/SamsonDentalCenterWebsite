-- Split single logo_url into website_logo_url + email_logo_url.
-- Rename preserves existing logo data; email logo starts empty (set in admin).

BEGIN;

ALTER TABLE public.clinic_config RENAME COLUMN logo_url TO website_logo_url;

ALTER TABLE public.clinic_config
  ADD COLUMN IF NOT EXISTS email_logo_url TEXT;

COMMIT;