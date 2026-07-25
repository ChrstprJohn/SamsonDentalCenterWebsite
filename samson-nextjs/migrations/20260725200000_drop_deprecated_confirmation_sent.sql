-- Migration: Drop deprecated confirmation_sent column (replaced by email_confirmation_sent / sms_confirmation_sent)
ALTER TABLE public.appointments DROP COLUMN IF EXISTS confirmation_sent;
