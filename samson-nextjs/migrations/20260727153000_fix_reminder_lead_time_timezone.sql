-- Fix reminder lead-time comparisons to compare TIMESTAMPTZ values directly.
-- Adding an 8-hour offset to CURRENT_TIMESTAMP made the skip/send windows drift.

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
       OR NEW.date IS DISTINCT FROM OLD.date
       OR NEW.confirmation_channel IS DISTINCT FROM OLD.confirmation_channel THEN

      IF v_duration < INTERVAL '24 hours' THEN
        NEW.email_reminder_24h_sent := TRUE;
        NEW.sms_reminder_24h_sent := TRUE;
        NEW.email_reminder_48h_sent := TRUE;
        NEW.sms_reminder_48h_sent := TRUE;
      ELSIF v_duration >= INTERVAL '24 hours' AND v_duration <= INTERVAL '48 hours' THEN
        NEW.email_reminder_48h_sent := TRUE;
        NEW.sms_reminder_48h_sent := TRUE;

        IF TG_OP = 'INSERT' OR NEW.start_time IS DISTINCT FROM OLD.start_time THEN
          NEW.email_reminder_24h_sent := FALSE;
          NEW.sms_reminder_24h_sent := FALSE;
        END IF;
      ELSE
        IF TG_OP = 'INSERT' OR NEW.start_time IS DISTINCT FROM OLD.start_time THEN
          NEW.email_reminder_24h_sent := FALSE;
          NEW.sms_reminder_24h_sent := FALSE;
          NEW.email_reminder_48h_sent := FALSE;
          NEW.sms_reminder_48h_sent := FALSE;
        END IF;
      END IF;
    END IF;
  ELSE
    NEW.email_reminder_24h_sent := FALSE;
    NEW.sms_reminder_24h_sent := FALSE;
    NEW.email_reminder_48h_sent := FALSE;
    NEW.sms_reminder_48h_sent := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.process_appointment_reminders_48h(p_channel TEXT DEFAULT 'BOTH')
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  v_app RECORD;
  v_channel TEXT := UPPER(COALESCE(p_channel, 'BOTH'));
BEGIN
  FOR v_app IN
    SELECT
      a.id,
      a.patient_id,
      a.service_id,
      a.doctor_id,
      a.date,
      a.start_time,
      a.email_reminder_48h_sent,
      a.sms_reminder_48h_sent,
      a.confirmation_channel
    FROM public.appointments a
    WHERE a.status = 'APPROVED'
      AND a.start_time IS NOT NULL
      AND a.start_time <= CURRENT_TIMESTAMP + INTERVAL '48 hours'
      AND a.start_time > CURRENT_TIMESTAMP
      AND (a.email_reminder_48h_sent = FALSE OR a.sms_reminder_48h_sent = FALSE)
  LOOP
    IF COALESCE(v_app.confirmation_channel, 'EMAIL') = 'NONE' THEN
      UPDATE public.appointments
      SET email_reminder_48h_sent = TRUE,
          sms_reminder_48h_sent = TRUE
      WHERE id = v_app.id;
      CONTINUE;
    END IF;

    IF v_channel IN ('EMAIL', 'BOTH') AND v_app.email_reminder_48h_sent = FALSE THEN
      INSERT INTO public.outbox (event_type, payload, status)
      VALUES ('APPOINTMENT_REMINDER_48H', jsonb_build_object(
        'appointmentId', v_app.id,
        'patientId', v_app.patient_id,
        'serviceId', v_app.service_id,
        'doctorId', v_app.doctor_id,
        'date', v_app.date,
        'startTime', v_app.start_time
      ), 'PENDING');

      UPDATE public.appointments
      SET email_reminder_48h_sent = TRUE
      WHERE id = v_app.id;

      v_count := v_count + 1;
    END IF;

    IF v_channel IN ('SMS', 'BOTH') AND v_app.sms_reminder_48h_sent = FALSE THEN
      INSERT INTO public.outbox (event_type, payload, status)
      VALUES ('APPOINTMENT_REMINDER_48H_SMS', jsonb_build_object(
        'appointmentId', v_app.id,
        'patientId', v_app.patient_id,
        'date', v_app.date,
        'startTime', v_app.start_time
      ), 'PENDING');

      UPDATE public.appointments
      SET sms_reminder_48h_sent = TRUE
      WHERE id = v_app.id;

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_appointment_reminders_24h(p_channel TEXT DEFAULT 'BOTH')
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  v_app RECORD;
  v_channel TEXT := UPPER(COALESCE(p_channel, 'BOTH'));
BEGIN
  FOR v_app IN
    SELECT
      a.id,
      a.patient_id,
      a.service_id,
      a.doctor_id,
      a.date,
      a.start_time,
      a.email_reminder_24h_sent,
      a.sms_reminder_24h_sent,
      a.confirmation_channel
    FROM public.appointments a
    WHERE a.status = 'APPROVED'
      AND a.start_time IS NOT NULL
      AND a.start_time <= CURRENT_TIMESTAMP + INTERVAL '24 hours'
      AND a.start_time > CURRENT_TIMESTAMP
      AND (a.email_reminder_24h_sent = FALSE OR a.sms_reminder_24h_sent = FALSE)
  LOOP
    IF COALESCE(v_app.confirmation_channel, 'EMAIL') = 'NONE' THEN
      UPDATE public.appointments
      SET email_reminder_24h_sent = TRUE,
          sms_reminder_24h_sent = TRUE
      WHERE id = v_app.id;
      CONTINUE;
    END IF;

    IF v_channel IN ('EMAIL', 'BOTH') AND v_app.email_reminder_24h_sent = FALSE THEN
      INSERT INTO public.outbox (event_type, payload, status)
      VALUES ('APPOINTMENT_REMINDER_24H', jsonb_build_object(
        'appointmentId', v_app.id,
        'patientId', v_app.patient_id,
        'serviceId', v_app.service_id,
        'doctorId', v_app.doctor_id,
        'date', v_app.date,
        'startTime', v_app.start_time
      ), 'PENDING');

      UPDATE public.appointments
      SET email_reminder_24h_sent = TRUE
      WHERE id = v_app.id;

      v_count := v_count + 1;
    END IF;

    IF v_channel IN ('SMS', 'BOTH') AND v_app.sms_reminder_24h_sent = FALSE THEN
      INSERT INTO public.outbox (event_type, payload, status)
      VALUES ('APPOINTMENT_REMINDER_24H_SMS', jsonb_build_object(
        'appointmentId', v_app.id,
        'patientId', v_app.patient_id,
        'date', v_app.date,
        'startTime', v_app.start_time
      ), 'PENDING');

      UPDATE public.appointments
      SET sms_reminder_24h_sent = TRUE
      WHERE id = v_app.id;

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;
