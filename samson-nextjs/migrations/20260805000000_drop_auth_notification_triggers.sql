-- Drop auth/internal notification triggers
-- Business is guest-only: keep NEW_INQUIRY (landing page inquiry),
-- NEW_MESSAGE (guest chat) and FAILED_EMAIL_ALERT (ops: guest email
-- failed, secretary must manually resend). These fire from:
--   trg_appointment_inquiries_inserted  -> NEW_INQUIRY
--   trg_notify_new_chat_message         -> NEW_MESSAGE
--   trg_outbox_failed                   -> FAILED_EMAIL_ALERT
-- Dropping the two below stops all auth booking / internal alerts
-- (NEW_APPOINTMENT_REQUEST, NEW_RESCHEDULE_REQUEST, PATIENT_CANCEL_ALERT,
--  TREATMENT_RENDERED, DOCTOR_VACATION_CONFLICT).

DROP TRIGGER IF EXISTS trg_appointment_notifications ON public.appointments;
DROP TRIGGER IF EXISTS trg_time_block_conflict ON public.time_blocks;
