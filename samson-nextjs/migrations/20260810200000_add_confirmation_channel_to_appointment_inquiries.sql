-- Add confirmation_channel to appointment_inquiries so secretaries can
-- persist the chosen channel before conversion (matches appointments table).
--
-- LIFECYCLE NOTE: staging-only column.
--   written: Save on pending request (staging only, survives re-open)
--   read:    converted -> copied verbatim into appointments.confirmation_channel
--            at conversion time (convert_inquiry_to_appointment RPC, p_confirmation_channel)
--   after:   never read again. Dead column. Source of truth post-convert is
--            appointments.confirmation_channel (drives outbox dispatch, reminders,
--            channel-aware triggers). The RPC does NOT read this column.
ALTER TABLE public.appointment_inquiries
  ADD COLUMN IF NOT EXISTS confirmation_channel TEXT NOT NULL DEFAULT 'EMAIL';
