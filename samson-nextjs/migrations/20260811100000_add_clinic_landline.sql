-- Store an optional public landline separately from the clinic mobile number.

ALTER TABLE public.clinic_config
  ADD COLUMN IF NOT EXISTS landline TEXT;
