-- Migration: Add outbox exponential retry backoff and opt-out / valid contact guards
-- Date: 2026-07-25

-- 1. Update claim_pending_events RPC to enforce retry backoff (retry_count * 5 minutes)
CREATE OR REPLACE FUNCTION public.claim_pending_events(batch_size INT)
RETURNS SETOF public.outbox AS $$
BEGIN
    RETURN QUERY
    WITH locked_rows AS (
        SELECT id FROM public.outbox
        WHERE status = 'PENDING'
          AND (
            retry_count = 0 
            OR updated_at <= CURRENT_TIMESTAMP - (retry_count * INTERVAL '5 minutes')
          )
        ORDER BY created_at ASC
        LIMIT claim_pending_events.batch_size
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.outbox
    SET status = 'PROCESSING'::public.outbox_status, updated_at = CURRENT_TIMESTAMP
    WHERE id IN (SELECT id FROM locked_rows)
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- 2. Update scan_and_queue_appointment_reminders function with opt-out & contact guards
CREATE OR REPLACE FUNCTION public.scan_and_queue_appointment_reminders()
RETURNS VOID AS $$
DECLARE
  v_app RECORD;
  v_channel TEXT;
BEGIN
  -- 2A. Scan for 48-Hour Reminders
  FOR v_app IN 
    SELECT 
      a.id, 
      a.confirmation_channel,
      a.email_reminder_48h_sent,
      a.sms_reminder_48h_sent,
      COALESCE(u.email, gc.email) AS recipient_email,
      COALESCE(u.phone_number, gc.phone_number) AS recipient_phone
    FROM public.appointments a
    LEFT JOIN public.users u ON a.patient_id = u.id
    LEFT JOIN public.guest_contacts gc ON a.id = gc.appointment_id
    WHERE a.status = 'APPROVED'
      AND a.start_time IS NOT NULL
      AND a.start_time <= CURRENT_TIMESTAMP + INTERVAL '8 hours' + INTERVAL '48 hours'
      AND a.start_time > CURRENT_TIMESTAMP + INTERVAL '8 hours'
      AND (a.email_reminder_48h_sent = FALSE OR a.sms_reminder_48h_sent = FALSE)
  LOOP
    v_channel := COALESCE(v_app.confirmation_channel, 'EMAIL');

    -- Opt-Out Guard
    IF v_channel = 'NONE' THEN
      UPDATE public.appointments 
      SET email_reminder_48h_sent = TRUE, 
          sms_reminder_48h_sent = TRUE 
      WHERE id = v_app.id;
      CONTINUE;
    END IF;

    -- Email Reminder 48H Guard: Check channel and non-empty email
    IF v_channel IN ('EMAIL', 'BOTH') AND v_app.email_reminder_48h_sent = FALSE THEN
      IF v_app.recipient_email IS NOT NULL AND TRIM(v_app.recipient_email) != '' THEN
        INSERT INTO public.outbox (event_type, payload)
        VALUES (
          'APPOINTMENT_REMINDER_48H',
          jsonb_build_object(
            'appointmentId', v_app.id,
            'email', TRIM(v_app.recipient_email)
          )
        );
      END IF;
      
      UPDATE public.appointments 
      SET email_reminder_48h_sent = TRUE 
      WHERE id = v_app.id;
    END IF;

    -- SMS Reminder 48H Guard: Check channel and non-empty phone
    IF v_channel IN ('SMS', 'BOTH') AND v_app.sms_reminder_48h_sent = FALSE THEN
      IF v_app.recipient_phone IS NOT NULL AND TRIM(v_app.recipient_phone) != '' THEN
        INSERT INTO public.outbox (event_type, payload)
        VALUES (
          'APPOINTMENT_REMINDER_48H_SMS',
          jsonb_build_object(
            'appointmentId', v_app.id,
            'phoneNumber', TRIM(v_app.recipient_phone)
          )
        );
      END IF;

      UPDATE public.appointments 
      SET sms_reminder_48h_sent = TRUE 
      WHERE id = v_app.id;
    END IF;

  END LOOP;

  -- 2B. Scan for 24-Hour Reminders
  FOR v_app IN 
    SELECT 
      a.id, 
      a.confirmation_channel,
      a.email_reminder_24h_sent,
      a.sms_reminder_24h_sent,
      COALESCE(u.email, gc.email) AS recipient_email,
      COALESCE(u.phone_number, gc.phone_number) AS recipient_phone
    FROM public.appointments a
    LEFT JOIN public.users u ON a.patient_id = u.id
    LEFT JOIN public.guest_contacts gc ON a.id = gc.appointment_id
    WHERE a.status = 'APPROVED'
      AND a.start_time IS NOT NULL
      AND a.start_time <= CURRENT_TIMESTAMP + INTERVAL '8 hours' + INTERVAL '24 hours'
      AND a.start_time > CURRENT_TIMESTAMP + INTERVAL '8 hours'
      AND (a.email_reminder_24h_sent = FALSE OR a.sms_reminder_24h_sent = FALSE)
  LOOP
    v_channel := COALESCE(v_app.confirmation_channel, 'EMAIL');

    -- Opt-Out Guard
    IF v_channel = 'NONE' THEN
      UPDATE public.appointments 
      SET email_reminder_24h_sent = TRUE, 
          sms_reminder_24h_sent = TRUE 
      WHERE id = v_app.id;
      CONTINUE;
    END IF;

    -- Email Reminder 24H Guard: Check channel and non-empty email
    IF v_channel IN ('EMAIL', 'BOTH') AND v_app.email_reminder_24h_sent = FALSE THEN
      IF v_app.recipient_email IS NOT NULL AND TRIM(v_app.recipient_email) != '' THEN
        INSERT INTO public.outbox (event_type, payload)
        VALUES (
          'APPOINTMENT_REMINDER_24H',
          jsonb_build_object(
            'appointmentId', v_app.id,
            'email', TRIM(v_app.recipient_email)
          )
        );
      END IF;

      UPDATE public.appointments 
      SET email_reminder_24h_sent = TRUE 
      WHERE id = v_app.id;
    END IF;

    -- SMS Reminder 24H Guard: Check channel and non-empty phone
    IF v_channel IN ('SMS', 'BOTH') AND v_app.sms_reminder_24h_sent = FALSE THEN
      IF v_app.recipient_phone IS NOT NULL AND TRIM(v_app.recipient_phone) != '' THEN
        INSERT INTO public.outbox (event_type, payload)
        VALUES (
          'APPOINTMENT_REMINDER_24H_SMS',
          jsonb_build_object(
            'appointmentId', v_app.id,
            'phoneNumber', TRIM(v_app.recipient_phone)
          )
        );
      END IF;

      UPDATE public.appointments 
      SET sms_reminder_24h_sent = TRUE 
      WHERE id = v_app.id;
    END IF;

  END LOOP;
END;
$$ LANGUAGE plpgsql;
