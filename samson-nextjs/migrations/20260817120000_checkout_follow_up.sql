-- Migration: 48-hour post-checkout follow-up email ("Kamusta" wellbeing check-in)
-- Date: 2026-08-17
-- Purpose: 48h after a completed appointment (where the checkout email was
--          actually sent), enqueue an APPOINTMENT_CHECKOUT_FOLLOW_UP outbox
--          event so the patient receives a wellbeing check-in email with a
--          link to the /wellbeing mood form.

-- 1. Add state tracking column to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS follow_up_48h_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Wellbeing check-in responses table (mirrors reviews RLS: staff select only;
--    inserts happen via the server action using the admin client)
CREATE TABLE IF NOT EXISTS public.checkout_follow_up_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    feeling TEXT NOT NULL,
    note TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkout_follow_up_responses_created_at
ON public.checkout_follow_up_responses(created_at DESC);

ALTER TABLE public.checkout_follow_up_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select follow-up responses for staff" ON public.checkout_follow_up_responses;
CREATE POLICY "Allow select follow-up responses for staff"
ON public.checkout_follow_up_responses
FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
);

-- 3. Scanner function: enqueue 48h follow-up for completed appointments whose
--    checkout email was sent, exactly 48 hours after the visit was marked done.
CREATE OR REPLACE FUNCTION public.scan_and_queue_checkout_follow_ups()
RETURNS VOID AS $$
DECLARE
  v_app RECORD;
BEGIN
  FOR v_app IN
    SELECT
      a.id,
      COALESCE(u.email, gc.email) AS recipient_email
    FROM public.appointments a
    LEFT JOIN public.users u ON a.patient_id = u.id
    LEFT JOIN public.guest_contacts gc ON a.id = gc.appointment_id
    WHERE a.status = 'COMPLETED'
      AND a.updated_at <= CURRENT_TIMESTAMP - INTERVAL '48 hours'
      AND a.follow_up_48h_sent = FALSE
      AND a.email_checkout_sent = TRUE
  LOOP
    IF v_app.recipient_email IS NOT NULL AND v_app.recipient_email != '' THEN
      INSERT INTO public.outbox (event_type, payload)
      VALUES (
        'APPOINTMENT_CHECKOUT_FOLLOW_UP',
        jsonb_build_object(
          'appointmentId', v_app.id,
          'email', v_app.recipient_email
        )
      );
    END IF;

    UPDATE public.appointments
    SET follow_up_48h_sent = TRUE
    WHERE id = v_app.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Enable pg_cron schedule if pg_cron extension exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'hourly-checkout-follow-up-scan',
      '0 * * * *',
      'SELECT public.scan_and_queue_checkout_follow_ups();'
    );
  END IF;
END $$;