-- Migration: Add appointment_id column to coordination_logs table to support appointment-scoped logs in Appointments Directory
-- Date: 2026-08-05

ALTER TABLE public.coordination_logs
    ALTER COLUMN inquiry_id DROP NOT NULL;

ALTER TABLE public.coordination_logs
    ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_coordination_logs_appointment_id
ON public.coordination_logs(appointment_id);

ALTER TABLE public.coordination_logs
    DROP CONSTRAINT IF EXISTS coordination_logs_inquiry_or_appointment_check;

ALTER TABLE public.coordination_logs
    ADD CONSTRAINT coordination_logs_inquiry_or_appointment_check
    CHECK (inquiry_id IS NOT NULL OR appointment_id IS NOT NULL);
