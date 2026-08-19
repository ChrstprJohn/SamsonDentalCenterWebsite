-- Migration: optional appointment link + free-text patient name
-- Date: 2026-08-17
-- Purpose: manual check-in log entries (phone/text) may lack a linked
--          completed appointment; store the caller's name instead.

ALTER TABLE public.checkout_follow_up_responses
ALTER COLUMN appointment_id DROP NOT NULL;

ALTER TABLE public.checkout_follow_up_responses
ADD COLUMN IF NOT EXISTS patient_name TEXT;