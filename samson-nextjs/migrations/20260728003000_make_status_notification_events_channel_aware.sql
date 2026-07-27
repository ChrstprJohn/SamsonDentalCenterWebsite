-- Emit only the notification channel selected on the appointment. This keeps
-- skipped channel events out of the delivery log and prevents them being
-- reported as PROCESSED when their subscriber intentionally did not send.
CREATE OR REPLACE FUNCTION public.trigger_on_appointment_status_change_outbox()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_name TEXT;
  v_service_name TEXT;
  v_outbox_payload JSONB;
  v_channel TEXT := COALESCE(NEW.confirmation_channel, 'EMAIL');
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'CANCELLED' AND OLD.status <> 'CANCELLED' THEN
    IF NEW.patient_id IS NOT NULL THEN
      SELECT first_name || ' ' || last_name INTO v_patient_name FROM public.users WHERE id = NEW.patient_id;
      IF NEW.dependent_id IS NOT NULL THEN
        SELECT first_name || ' ' || last_name INTO v_patient_name FROM public.dependents WHERE id = NEW.dependent_id;
      END IF;
    ELSE
      SELECT first_name || ' ' || last_name INTO v_patient_name
      FROM public.guest_contacts WHERE appointment_id = NEW.id LIMIT 1;
    END IF;

    SELECT name INTO v_service_name FROM public.services WHERE id = NEW.service_id;
    v_outbox_payload := jsonb_build_object(
      'appointmentId', NEW.id,
      'patientName', COALESCE(v_patient_name, 'Patient'),
      'serviceName', COALESCE(v_service_name, 'Dental Appointment'),
      'date', NEW.date,
      'startTime', NEW.start_time
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

  IF TG_OP = 'UPDATE'
     AND NEW.status = 'APPROVED'
     AND OLD.status IN ('APPROVED', 'RESCHEDULE_REQUESTED')
     AND (OLD.date IS DISTINCT FROM NEW.date OR OLD.start_time IS DISTINCT FROM NEW.start_time) THEN
    v_outbox_payload := jsonb_build_object(
      'appointmentId', NEW.id,
      'patientId', NEW.patient_id,
      'date', NEW.date,
      'startTime', NEW.start_time
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
