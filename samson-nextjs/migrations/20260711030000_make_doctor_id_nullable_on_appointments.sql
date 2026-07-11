-- Migration: Make doctor_id nullable on appointments table
-- Date: 2026-07-11
-- Reason: PENDING appointments may have no doctor assigned yet (ANY doctor preference).
--         Secretary assigns the doctor when confirming the booking.

ALTER TABLE public.appointments ALTER COLUMN doctor_id DROP NOT NULL;

-- Note: The exclusion constraint no_overlapping_appointments already excludes PENDING rows
-- (see migration 20260711020000), so NULL doctor_id in PENDING state will not trigger overlap errors.
