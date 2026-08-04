-- Migration: Enhance REJECT_INQUIRY outbox payload in status change trigger
-- Date: 2026-08-04

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

    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('CANCEL_BOOKING', v_outbox_payload, 'PENDING');

    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('CANCEL_BOOKING_SMS', v_outbox_payload, 'PENDING');

  END IF;

  -- 2. RESCHEDULE
  IF TG_OP = 'UPDATE'
     AND NEW.status = 'APPROVED'
     AND OLD.status IN ('APPROVED', 'RESCHEDULE_REQUESTED')
     AND (OLD.date IS DISTINCT FROM NEW.date OR OLD.start_time IS DISTINCT FROM NEW.start_time) THEN

    v_outbox_payload := jsonb_build_object(
      'appointmentId', NEW.id,
      'patientId',     NEW.patient_id,
      'date',          NEW.date,
      'startTime',     NEW.start_time
    );

    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('RESCHEDULE_BOOKING', v_outbox_payload, 'PENDING');

    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('RESCHEDULE_BOOKING_SMS', v_outbox_payload, 'PENDING');

  END IF;

  -- 3. REJECTION
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
