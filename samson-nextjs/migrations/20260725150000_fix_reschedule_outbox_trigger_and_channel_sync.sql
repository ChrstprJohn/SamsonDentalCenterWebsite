-- Migration: Fix reschedule outbox trigger for Hold-and-Swap approvals & channel change reminder flag sync
-- Date: 2026-07-25

-- 1. Update trigger_on_appointment_status_change_outbox to catch Hold-and-Swap reschedule approvals
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
  -- 1. Silent cancellation trigger
  IF TG_OP = 'UPDATE' AND NEW.status = 'CANCELLED' AND OLD.status <> 'CANCELLED' THEN
    -- Fetch patient/guest name
    IF NEW.patient_id IS NOT NULL THEN
      SELECT first_name || ' ' || last_name
      INTO v_patient_name
      FROM public.users
      WHERE id = NEW.patient_id;
      -- Use dependent if resolved
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

    -- Fetch service name
    SELECT name INTO v_service_name FROM public.services WHERE id = NEW.service_id;

    v_outbox_payload := jsonb_build_object(
      'appointmentId', NEW.id,
      'patientName', COALESCE(v_patient_name, 'Patient'),
      'serviceName', COALESCE(v_service_name, 'Dental Appointment'),
      'date', NEW.date,
      'startTime', NEW.start_time
    );

    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('CANCEL_BOOKING', v_outbox_payload, 'PENDING');
  END IF;

  -- 2. Silent reschedule trigger (Handles direct secretary reschedules AND Hold-and-Swap approvals)
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

    INSERT INTO public.outbox (event_type, payload, status)
    VALUES ('RESCHEDULE_BOOKING', v_outbox_payload, 'PENDING');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appointment_status_change_outbox ON public.appointments;
CREATE TRIGGER trg_appointment_status_change_outbox
AFTER UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_on_appointment_status_change_outbox();


-- 2. Update initialize_appointment_reminders trigger to re-sync flags if confirmation_channel changes
CREATE OR REPLACE FUNCTION public.initialize_appointment_reminders()
RETURNS TRIGGER AS $$
DECLARE
  v_duration INTERVAL;
BEGIN
  IF NEW.start_time IS NOT NULL THEN
    v_duration := NEW.start_time - (CURRENT_TIMESTAMP + INTERVAL '8 hours');

    IF TG_OP = 'INSERT' 
       OR OLD.start_time IS NULL 
       OR NEW.start_time IS DISTINCT FROM OLD.start_time 
       OR NEW.date IS DISTINCT FROM OLD.date 
       OR NEW.confirmation_channel IS DISTINCT FROM OLD.confirmation_channel THEN
      
      IF v_duration < INTERVAL '24 hours' THEN
        -- Booked or updated < 24h away: skip all 24h & 48h reminders
        NEW.reminder_24h_sent := TRUE;
        NEW.reminder_48h_sent := TRUE;
        NEW.email_reminder_24h_sent := TRUE;
        NEW.sms_reminder_24h_sent := TRUE;
        NEW.email_reminder_48h_sent := TRUE;
        NEW.sms_reminder_48h_sent := TRUE;
      ELSIF v_duration >= INTERVAL '24 hours' AND v_duration <= INTERVAL '48 hours' THEN
        -- Booked or updated between 24h and 48h away: skip 48h reminders, keep current 24h state
        NEW.reminder_48h_sent := TRUE;
        NEW.email_reminder_48h_sent := TRUE;
        NEW.sms_reminder_48h_sent := TRUE;

        -- For 24h: only set to FALSE if it hasn't sent yet
        IF TG_OP = 'INSERT' OR NEW.start_time IS DISTINCT FROM OLD.start_time THEN
          NEW.reminder_24h_sent := FALSE;
          NEW.email_reminder_24h_sent := FALSE;
          NEW.sms_reminder_24h_sent := FALSE;
        END IF;
      ELSE
        -- Booked or updated > 48h away: reset all if date/time changed or new insert
        IF TG_OP = 'INSERT' OR NEW.start_time IS DISTINCT FROM OLD.start_time THEN
          NEW.reminder_24h_sent := FALSE;
          NEW.reminder_48h_sent := FALSE;
          NEW.email_reminder_24h_sent := FALSE;
          NEW.sms_reminder_24h_sent := FALSE;
          NEW.email_reminder_48h_sent := FALSE;
          NEW.sms_reminder_48h_sent := FALSE;
        END IF;
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
