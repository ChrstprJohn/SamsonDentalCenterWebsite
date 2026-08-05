-- Migration: Reset reminder flags & update status change outbox trigger on reschedule
-- Date: 2026-08-05
-- Fixes:
-- 1. Reset email_reschedule_sent, sms_reschedule_sent, and 24h/48h reminder flags when appointment date or start_time is rescheduled.
-- 2. Expand status change outbox trigger to emit RESCHEDULE_BOOKING / RESCHEDULE_BOOKING_SMS for PENDING, DISPLACED, NO_SHOW transitions when rescheduled.

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

      -- Reset reschedule sent flags when appointment date/time changes upon reschedule
      IF TG_OP = 'UPDATE' AND (NEW.start_time IS DISTINCT FROM OLD.start_time OR NEW.date IS DISTINCT FROM OLD.date) THEN
        NEW.email_reschedule_sent := FALSE;
        NEW.sms_reschedule_sent := FALSE;
      END IF;

      IF v_duration < INTERVAL '24 hours' THEN
        NEW.email_reminder_24h_sent := TRUE;
        NEW.sms_reminder_24h_sent := TRUE;
        NEW.email_reminder_48h_sent := TRUE;
        NEW.sms_reminder_48h_sent := TRUE;
      ELSIF v_duration >= INTERVAL '24 hours' AND v_duration <= INTERVAL '48 hours' THEN
        NEW.email_reminder_48h_sent := TRUE;
        NEW.sms_reminder_48h_sent := TRUE;

        IF TG_OP = 'INSERT' OR NEW.start_time IS DISTINCT FROM OLD.start_time OR NEW.date IS DISTINCT FROM OLD.date THEN
          NEW.email_reminder_24h_sent := FALSE;
          NEW.sms_reminder_24h_sent := FALSE;
        END IF;
      ELSE
        IF TG_OP = 'INSERT' OR NEW.start_time IS DISTINCT FROM OLD.start_time OR NEW.date IS DISTINCT FROM OLD.date THEN
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

CREATE OR REPLACE FUNCTION public.trigger_on_appointment_status_change_outbox()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_name TEXT;
  v_patient_email TEXT;
  v_service_name TEXT;
  v_outbox_payload JSONB;
  v_channel TEXT := COALESCE(NEW.confirmation_channel, 'EMAIL');
BEGIN
  -- 1. CANCELLATION
  IF TG_OP = 'UPDATE' AND NEW.status = 'CANCELLED' AND OLD.status <> 'CANCELLED' THEN
    IF NEW.patient_id IS NOT NULL THEN
      SELECT first_name || ' ' || last_name
      INTO v_patient_name
      FROM public.users
      WHERE id = NEW.patient_id;

      IF NEW.dependent_id IS NOT NULL THEN
        SELECT first_name || ' ' || last_name
        INTO v_patient_name
        FROM public.dependents
        WHERE id = NEW.dependent_id;
      END IF;
    ELSE
      SELECT first_name || ' ' || last_name
      INTO v_patient_name
      FROM public.guest_contacts
      WHERE appointment_id = NEW.id
      LIMIT 1;
    END IF;

    SELECT name INTO v_service_name FROM public.services WHERE id = NEW.service_id;

    v_outbox_payload := jsonb_build_object(
      'appointmentId', NEW.id,
      'patientName',   COALESCE(v_patient_name, 'Patient'),
      'serviceName',   COALESCE(v_service_name, 'Dental Appointment'),
      'cancellationReason', COALESCE(NEW.status_reason, 'This appointment has been cancelled as requested.'),
      'date',          NEW.date,
      'startTime',     NEW.start_time
    );

    IF v_channel IN ('EMAIL', 'BOTH') THEN
      INSERT INTO public.outbox (event_type, payload, status)
      VALUES ('CANCEL_BOOKING', v_outbox_payload, 'PENDING');
    END IF;
    IF v_channel IN ('SMS', 'BOTH') THEN
      INSERT INTO public.outbox (event_type, payload, status)
      VALUES ('CANCEL_BOOKING_SMS', v_outbox_payload, 'PENDING');
    END IF;
  END IF;

  -- 2. RESCHEDULE
  IF TG_OP = 'UPDATE'
     AND NEW.status = 'APPROVED'
     AND OLD.status IN ('APPROVED', 'RESCHEDULE_REQUESTED', 'PENDING', 'DISPLACED', 'NO_SHOW')
     AND (OLD.date IS DISTINCT FROM NEW.date OR OLD.start_time IS DISTINCT FROM NEW.start_time) THEN

    v_outbox_payload := jsonb_build_object(
      'appointmentId', NEW.id,
      'patientId',     NEW.patient_id,
      'date',          NEW.date,
      'startTime',     NEW.start_time
    );

    IF v_channel IN ('EMAIL', 'BOTH') THEN
      INSERT INTO public.outbox (event_type, payload, status)
      VALUES ('RESCHEDULE_BOOKING', v_outbox_payload, 'PENDING');
    END IF;
    IF v_channel IN ('SMS', 'BOTH') THEN
      INSERT INTO public.outbox (event_type, payload, status)
      VALUES ('RESCHEDULE_BOOKING_SMS', v_outbox_payload, 'PENDING');
    END IF;
  END IF;

  -- 3. REJECTION (email-only event; intentionally ungated)
  IF TG_OP = 'UPDATE' AND NEW.status = 'REJECTED' AND OLD.status <> 'REJECTED' THEN

    IF NEW.patient_id IS NOT NULL THEN
      SELECT first_name || ' ' || last_name, email
      INTO v_patient_name, v_patient_email
      FROM public.users
      WHERE id = NEW.patient_id;
    ELSE
      SELECT first_name || ' ' || last_name, email
      INTO v_patient_name, v_patient_email
      FROM public.guest_contacts
      WHERE appointment_id = NEW.id
      LIMIT 1;
    END IF;

    v_outbox_payload := jsonb_build_object(
      'appointmentId', NEW.id,
      'patientId',     NEW.patient_id,
      'patientName',   COALESCE(v_patient_name, 'Valued Patient'),
      'recipientEmail', COALESCE(v_patient_email, ''),
      'rejectionReason', COALESCE(NEW.status_reason, 'Unfortunately, we are unable to accommodate your request at this time.')
    );

    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('REJECT_INQUIRY', v_outbox_payload, 'PENDING');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
