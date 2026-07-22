-- Migration: Add DOB and Time Preference to Inquiries
-- Date: 2026-07-11

ALTER TABLE public.appointment_inquiries ADD COLUMN date_of_birth DATE;
ALTER TABLE public.appointment_inquiries ADD COLUMN time_preference TEXT;
ALTER TABLE public.appointment_inquiries ADD CONSTRAINT check_time_preference CHECK (time_preference IN ('MORNING', 'AFTERNOON'));
