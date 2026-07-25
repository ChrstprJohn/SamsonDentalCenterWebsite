-- Migration: Update appointment reminders trigger and scanner to be channel-aware
-- Date: 2026-07-25

-- 1. Updated trigger function to set both general and channel-specific reminder flags
CREATE OR REPLACE FUNCTION public.initialize_appointment_reminders()
RETURNS TRIGGER AS $$
DECLARE
  v_duration INTERVAL;
BEGIN
  IF NEW.start_time IS NOT NULL THEN
    v_duration := NEW.start_time - CURRENT_TIMESTAMP;

    IF TG_OP = 'INSERT' 
       OR OLD.start_time IS NULL 
       OR NEW.start_time IS DISTINCT FROM OLD.start_time 
       OR NEW.date IS DISTINCT FROM OLD.date THEN
      
      IF v_duration < INTERVAL '24 hours' THEN
        -- Booked < 24h away: skip all 24h & 48h reminders
        NEW.reminder_24h_sent := TRUE;
        NEW.reminder_48h_sent := TRUE;
        NEW.email_reminder_24h_sent := TRUE;
        NEW.sms_reminder_24h_sent := TRUE;
        NEW.email_reminder_48h_sent := TRUE;
        NEW.sms_reminder_48h_sent := TRUE;
      ELSIF v_duration >= INTERVAL '24 hours' AND v_duration <= INTERVAL '48 hours' THEN
        -- Booked between 24h and 48h away: skip 48h reminders, enable 24h reminders
        NEW.reminder_24h_sent := FALSE;
        NEW.reminder_48h_sent := TRUE;
        NEW.email_reminder_24h_sent := FALSE;
        NEW.sms_reminder_24h_sent := FALSE;
        NEW.email_reminder_48h_sent := TRUE;
        NEW.sms_reminder_48h_sent := TRUE;
      ELSE
        -- Booked > 48h away: enable all 24h & 48h reminders
        NEW.reminder_24h_sent := FALSE;
        NEW.reminder_48h_sent := FALSE;
        NEW.email_reminder_24h_sent := FALSE;
        NEW.sms_reminder_24h_sent := FALSE;
        NEW.email_reminder_48h_sent := FALSE;
        NEW.sms_reminder_48h_sent := FALSE;
      END IF;
    END IF;
  ELSE
    -- If no start_time set yet, reset all flags
    NEW.reminder_24h_sent := FALSE;
    NEW.reminder_48h_sent := FALSE;
    NEW.email_reminder_24h_sent := FALSE;
    NEW.sms_reminder_24h_sent := FALSE;
    NEW.email_reminder_48h_sent := FALSE;
    NEW.sms_reminder_48h_sent := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Scanner function to select upcoming appointments and enqueue channel-specific outbox events
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
      AND a.start_time <= CURRENT_TIMESTAMP + INTERVAL '48 hours'
      AND a.start_time > CURRENT_TIMESTAMP
      AND (a.email_reminder_48h_sent = FALSE OR a.sms_reminder_48h_sent = FALSE OR a.reminder_48h_sent = FALSE)
  LOOP
    v_channel := COALESCE(v_app.confirmation_channel, 'EMAIL');

    -- Email Reminder 48H
    IF v_channel IN ('EMAIL', 'BOTH') AND v_app.email_reminder_48h_sent = FALSE THEN
      IF v_app.recipient_email IS NOT NULL AND v_app.recipient_email != '' THEN
        INSERT INTO public.outbox (event_type, payload)
        VALUES (
          'APPOINTMENT_REMINDER_48H',
          jsonb_build_object(
            'appointmentId', v_app.id,
            'email', v_app.recipient_email
          )
        );
      END IF;
      
      UPDATE public.appointments 
      SET email_reminder_48h_sent = TRUE 
      WHERE id = v_app.id;
    END IF;

    -- SMS Reminder 48H
    IF v_channel IN ('SMS', 'BOTH') AND v_app.sms_reminder_48h_sent = FALSE THEN
      IF v_app.recipient_phone IS NOT NULL AND v_app.recipient_phone != '' THEN
        INSERT INTO public.outbox (event_type, payload)
        VALUES (
          'APPOINTMENT_REMINDER_48H_SMS',
          jsonb_build_object(
            'appointmentId', v_app.id,
            'phoneNumber', v_app.recipient_phone
          )
        );
      END IF;

      UPDATE public.appointments 
      SET sms_reminder_48h_sent = TRUE 
      WHERE id = v_app.id;
    END IF;

    -- Update legacy summary column
    UPDATE public.appointments
    SET reminder_48h_sent = TRUE
    WHERE id = v_app.id;
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
      AND a.start_time <= CURRENT_TIMESTAMP + INTERVAL '24 hours'
      AND a.start_time > CURRENT_TIMESTAMP
      AND (a.email_reminder_24h_sent = FALSE OR a.sms_reminder_24h_sent = FALSE OR a.reminder_24h_sent = FALSE)
  LOOP
    v_channel := COALESCE(v_app.confirmation_channel, 'EMAIL');

    -- Email Reminder 24H
    IF v_channel IN ('EMAIL', 'BOTH') AND v_app.email_reminder_24h_sent = FALSE THEN
      IF v_app.recipient_email IS NOT NULL AND v_app.recipient_email != '' THEN
        INSERT INTO public.outbox (event_type, payload)
        VALUES (
          'APPOINTMENT_REMINDER_24H',
          jsonb_build_object(
            'appointmentId', v_app.id,
            'email', v_app.recipient_email
          )
        );
      END IF;

      UPDATE public.appointments 
      SET email_reminder_24h_sent = TRUE 
      WHERE id = v_app.id;
    END IF;

    -- SMS Reminder 24H
    IF v_channel IN ('SMS', 'BOTH') AND v_app.sms_reminder_24h_sent = FALSE THEN
      IF v_app.recipient_phone IS NOT NULL AND v_app.recipient_phone != '' THEN
        INSERT INTO public.outbox (event_type, payload)
        VALUES (
          'APPOINTMENT_REMINDER_24H_SMS',
          jsonb_build_object(
            'appointmentId', v_app.id,
            'phoneNumber', v_app.recipient_phone
          )
        );
      END IF;

      UPDATE public.appointments 
      SET sms_reminder_24h_sent = TRUE 
      WHERE id = v_app.id;
    END IF;

    -- Update legacy summary column
    UPDATE public.appointments
    SET reminder_24h_sent = TRUE
    WHERE id = v_app.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
