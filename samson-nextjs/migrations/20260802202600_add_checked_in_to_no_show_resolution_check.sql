-- Update CHECK constraint on appointments.no_show_resolution to include 'CHECKED_IN'
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_no_show_resolution_check;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_no_show_resolution_check
    CHECK (no_show_resolution IN ('COMPLETED', 'CONFIRMED_NO_SHOW', 'RESCHEDULE', 'CHECKED_IN'));
