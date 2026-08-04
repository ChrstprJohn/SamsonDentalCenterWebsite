-- Migration: Add REJECT_INQUIRY to status-change outbox trigger
-- Date: 2026-08-04
--
-- Consolidates REJECTED status transitions into the DB trigger
-- so that rejection outbox events are emitted automatically whenever status becomes REJECTED.

CREATE OR REPLACE FUNCTION public.trigger_on_appointment_status_change_outbox()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_name TEXT;
  v_service_name TEXT;
  v_outbox_payload JSONB;
BEGIN
  -- ─────────────────────────────────────────────────────────────────────────────
  -- 1. CANCELLATION — status transitions TO 'CANCELLED'
  -- Emits both email and SMS outbox events in one shot.
  -- ─────────────────────────────────────────────────────────────────────────────
  IF TG_OP = 'UPDATE' AND NEW.status = 'CANCELLED' AND OLD.status <> 'CANCELLED' THEN

    -- Resolve patient/guest name
    IF NEW.patient_id IS NOT NULL THEN
      SELECT first_name || ' ' || last_name
      INTO v_patient_name
      FROM public.users
      WHERE id = NEW.patient_id;

      -- Prefer dependent name if linked
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

    -- Resolve service name
    SELECT name INTO v_service_name FROM public.services WHERE id = NEW.service_id;

    v_outbox_payload := jsonb_build_object(
      'appointmentId', NEW.id,
      'patientName',   COALESCE(v_patient_name, 'Patient'),
      'serviceName',   COALESCE(v_service_name, 'Dental Appointment'),
      'cancellationReason', COALESCE(NEW.status_reason, 'This appointment has been cancelled as requested.'),
      'date',          NEW.date,
      'startTime',     NEW.start_time
    );

    -- Email cancellation notification
    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('CANCEL_BOOKING', v_outbox_payload, 'PENDING');

    -- SMS cancellation notification
    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('CANCEL_BOOKING_SMS', v_outbox_payload, 'PENDING');

  END IF;

  -- ─────────────────────────────────────────────────────────────────────────────
  -- 2. RESCHEDULE — status stays/becomes 'APPROVED' and date/time actually changed
  -- Handles both direct secretary reschedules and Hold-and-Swap approvals.
  -- ─────────────────────────────────────────────────────────────────────────────
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

    -- Email reschedule notification
    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('RESCHEDULE_BOOKING', v_outbox_payload, 'PENDING');

    -- SMS reschedule notification
    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('RESCHEDULE_BOOKING_SMS', v_outbox_payload, 'PENDING');

  END IF;

  -- ─────────────────────────────────────────────────────────────────────────────
  -- 3. REJECTION — status transitions TO 'REJECTED'
  -- Emits REJECT_INQUIRY outbox event when booking inquiry/request is declined.
  -- ─────────────────────────────────────────────────────────────────────────────
  IF TG_OP = 'UPDATE' AND NEW.status = 'REJECTED' AND OLD.status <> 'REJECTED' THEN

    v_outbox_payload := jsonb_build_object(
      'appointmentId', NEW.id,
      'patientId',     NEW.patient_id,
      'rejectionReason', COALESCE(NEW.status_reason, 'Unfortunately, we are unable to accommodate your request at this time.')
    );

    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('REJECT_INQUIRY', v_outbox_payload, 'PENDING');

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-attach trigger
DROP TRIGGER IF EXISTS trg_appointment_status_change_outbox ON public.appointments;
CREATE TRIGGER trg_appointment_status_change_outbox
AFTER UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_on_appointment_status_change_outbox();
