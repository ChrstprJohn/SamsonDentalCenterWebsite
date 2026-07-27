-- Keep cancellation and reschedule sent state channel-specific, just like
-- booking confirmations, reminders, and checkout notifications.
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS email_cancel_sent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sms_cancel_sent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_reschedule_sent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sms_reschedule_sent BOOLEAN NOT NULL DEFAULT FALSE;
