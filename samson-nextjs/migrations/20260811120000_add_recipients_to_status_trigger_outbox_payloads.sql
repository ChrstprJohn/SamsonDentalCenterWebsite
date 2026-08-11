-- Migration: Add recipient email/phone into status-change outbox payloads
-- Date: 2026-08-11
-- Fixes: RESCHEDULE_BOOKING(_SMS) and CANCEL_BOOKING(_SMS) outbox rows carried no
--        email/phone keys, so log views fell back to "System Automated Dispatch"
--        for guest appointments (no patient_id to backfill from). Subscribers
--        resolve recipients from the DB themselves, so delivery was unaffected;
--        this only enriches the payload so logs can display the real recipient.
--        Depends on: 20260810183000_record_status_history_on_reschedule.sql

CREATE OR REPLACE FUNCTION public.trigger_on_appointment_status_change_outbox()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_name TEXT;
  v_patient_email TEXT;
  v_patient_phone TEXT;
  v_service_name TEXT;
  v_old_doctor_name TEXT;
  v_old_service_name TEXT;
  v_outbox_payload JSONB;
  v_channel TEXT := COALESCE(NEW.confirmation_channel, 'EMAIL');
BEGIN
  -- 1. CANCELLATION
  IF TG_OP = 'UPDATE' AND NEW.status = 'CANCELLED' AND OLD.status <> 'CANCELLED' THEN
    IF NEW.patient_id IS NOT NULL THEN
      SELECT first_name || ' ' || last_name, email, phone_number
      INTO v_patient_name, v_patient_email, v_patient_phone
      FROM public.users
      WHERE id = NEW.patient_id;

      IF NEW.dependent_id IS NOT NULL THEN
        SELECT first_name || ' ' || last_name
        INTO v_patient_name
        FROM public.dependents
        WHERE id = NEW.dependent_id;
      END IF;
    ELSE
      SELECT first_name || ' ' || last_name, email, phone_number
      INTO v_patient_name, v_patient_email, v_patient_phone
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
      'startTime',     NEW.start_time,
      'email',         v_patient_email,
      'phoneNumber',   v_patient_phone
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
     AND (
       OLD.date IS DISTINCT FROM NEW.date
       OR OLD.start_time IS DISTINCT FROM NEW.start_time
       OR OLD.end_time IS DISTINCT FROM NEW.end_time
       OR OLD.service_id IS DISTINCT FROM NEW.service_id
       OR OLD.doctor_id IS DISTINCT FROM NEW.doctor_id
     ) THEN

    IF OLD.doctor_id IS NOT NULL THEN
      SELECT first_name || ' ' || last_name
      INTO v_old_doctor_name
      FROM public.users
      WHERE id = OLD.doctor_id;
    ELSE
      v_old_doctor_name := NULL;
    END IF;

    IF OLD.service_id IS NOT NULL THEN
      SELECT name
      INTO v_old_service_name
      FROM public.services
      WHERE id = OLD.service_id;
    ELSE
      v_old_service_name := NULL;
    END IF;

    IF NEW.patient_id IS NOT NULL THEN
      SELECT email, phone_number
      INTO v_patient_email, v_patient_phone
      FROM public.users
      WHERE id = NEW.patient_id;
    ELSE
      SELECT email, phone_number
      INTO v_patient_email, v_patient_phone
      FROM public.guest_contacts
      WHERE appointment_id = NEW.id
      LIMIT 1;
    END IF;

    v_outbox_payload := jsonb_build_object(
      'appointmentId',    NEW.id,
      'patientId',        NEW.patient_id,
      'date',             NEW.date,
      'startTime',        NEW.start_time,
      'endTime',          NEW.end_time,
      'oldDate',          OLD.date,
      'oldStartTime',     OLD.start_time,
      'oldEndTime',       OLD.end_time,
      'oldDoctorName',    CASE WHEN v_old_doctor_name IS NOT NULL THEN 'Dr. ' || v_old_doctor_name ELSE NULL END,
      'oldServiceName',   v_old_service_name,
      'rescheduleReason', NEW.status_reason,
      'email',            v_patient_email,
      'phoneNumber',      v_patient_phone
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
