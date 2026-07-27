-- Migration: Add CANCEL_BOOKING_SMS and RESCHEDULE_BOOKING_SMS to the status-change outbox trigger
-- Date: 2026-07-27
--
-- Previously, CANCEL_BOOKING_SMS and RESCHEDULE_BOOKING_SMS were emitted app-side (TypeScript action).
-- This migration moves both into the DB trigger so that cancel and reschedule events (email + SMS)
-- are fully consolidated in one place: trigger_on_appointment_status_change_outbox.
--
-- After this migration, the app-level emits for these two events must be removed from the action.

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
      'date',          NEW.date,
      'startTime',     NEW.start_time
    );

    -- Email cancellation notification
    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('CANCEL_BOOKING', v_outbox_payload, 'PENDING');

    -- SMS cancellation notification (same payload — subscriber checks channel preference)
    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('CANCEL_BOOKING_SMS', v_outbox_payload, 'PENDING');

  END IF;

  -- ─────────────────────────────────────────────────────────────────────────────
  -- 2. RESCHEDULE — status stays/becomes 'APPROVED' and date/time actually changed
  -- Handles both direct secretary reschedules and Hold-and-Swap approvals.
  -- Emits both email and SMS outbox events in one shot.
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

    -- SMS reschedule notification (same payload — subscriber checks channel preference)
    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('RESCHEDULE_BOOKING_SMS', v_outbox_payload, 'PENDING');

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-attach trigger (DROP + CREATE to be safe with OR REPLACE)
DROP TRIGGER IF EXISTS trg_appointment_status_change_outbox ON public.appointments;
CREATE TRIGGER trg_appointment_status_change_outbox
AFTER UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_on_appointment_status_change_outbox();
