-- Migration: Record appointment_status_history ledger entry & trigger notifications when rescheduling date, time, service, or doctor
-- Date: 2026-08-10
-- Fixes:
-- 1. When an appointment in APPROVED status is rescheduled by staff, record status history ledger entry.
-- 2. Expand status change outbox trigger to emit RESCHEDULE_BOOKING / RESCHEDULE_BOOKING_SMS when date, start_time, end_time, service_id, or doctor_id changes.
-- 3. Reset email_reschedule_sent / sms_reschedule_sent and recalculate reminder flags on reschedule.

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
       OR NEW.end_time IS DISTINCT FROM OLD.end_time
       OR NEW.service_id IS DISTINCT FROM OLD.service_id
       OR NEW.doctor_id IS DISTINCT FROM OLD.doctor_id
       OR NEW.confirmation_channel IS DISTINCT FROM OLD.confirmation_channel THEN

      -- Reset reschedule sent flags when appointment date, time, service, or doctor changes upon reschedule
      IF TG_OP = 'UPDATE' AND (
        NEW.start_time IS DISTINCT FROM OLD.start_time
        OR NEW.date IS DISTINCT FROM OLD.date
        OR NEW.end_time IS DISTINCT FROM OLD.end_time
        OR NEW.service_id IS DISTINCT FROM OLD.service_id
        OR NEW.doctor_id IS DISTINCT FROM OLD.doctor_id
      ) THEN
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
  v_old_doctor_name TEXT;
  v_old_service_name TEXT;
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
      'rescheduleReason', NEW.status_reason
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

CREATE OR REPLACE FUNCTION public.update_appointment_status_transaction(
    p_appointment_id      UUID,
    p_actor_id            UUID,
    p_actor_role          TEXT,
    p_new_status          public.appointment_status,
    p_reason              TEXT          DEFAULT NULL,
    p_reschedule_date     DATE          DEFAULT NULL,
    p_reschedule_start    TIMESTAMPTZ   DEFAULT NULL,
    p_reschedule_end      TIMESTAMPTZ   DEFAULT NULL,
    p_reschedule_doctor   UUID          DEFAULT NULL,
    p_reschedule_service  UUID          DEFAULT NULL,
    p_clear_proposed      BOOLEAN       DEFAULT FALSE,
    p_reschedule_count    INT           DEFAULT NULL,
    p_expected_status     public.appointment_status DEFAULT NULL
) RETURNS SETOF public.appointments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_previous_status public.appointment_status;
    v_patient_id      UUID;
    v_updated_row     public.appointments;
BEGIN
    -- 1. Fetch current status + patient_id (existence check)
    SELECT status, patient_id
    INTO v_previous_status, v_patient_id
    FROM public.appointments
    WHERE id = p_appointment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment % not found', p_appointment_id;
    END IF;

    -- 2. ACID guard: if caller declared an expected prior status, enforce it atomically.
    --    This prevents concurrent requests from both succeeding when one already mutated the row.
    IF p_expected_status IS NOT NULL AND v_previous_status <> p_expected_status THEN
        RAISE EXCEPTION
            'Concurrent status conflict on appointment %. Expected %, found %.',
            p_appointment_id, p_expected_status, v_previous_status
            USING ERRCODE = 'P0002';
    END IF;

    -- 3. Update the appointment row atomically
    UPDATE public.appointments
    SET
        status        = p_new_status,
        status_reason = p_reason,
        updated_at    = NOW(),
        -- Reschedule actual slot (secretary direct reschedule or Hold-and-Swap approval)
        date          = COALESCE(p_reschedule_date,    date),
        start_time    = COALESCE(p_reschedule_start,   start_time),
        end_time      = COALESCE(p_reschedule_end,     end_time),
        doctor_id     = COALESCE(p_reschedule_doctor,  doctor_id),
        service_id    = COALESCE(p_reschedule_service, service_id),
        -- Reschedule count
        reschedule_count = COALESCE(p_reschedule_count, reschedule_count),
        -- Clear proposed metadata when Hold-and-Swap resolves (approve or reject)
        proposed_date        = CASE WHEN p_clear_proposed THEN NULL ELSE proposed_date END,
        proposed_start_time  = CASE WHEN p_clear_proposed THEN NULL ELSE proposed_start_time END,
        proposed_end_time    = CASE WHEN p_clear_proposed THEN NULL ELSE proposed_end_time END,
        proposed_doctor_id   = CASE WHEN p_clear_proposed THEN NULL ELSE proposed_doctor_id END
    WHERE id = p_appointment_id
    RETURNING * INTO v_updated_row;

    -- 4. Append ledger entry (if status changed OR proposed metadata was cleared OR slot was rescheduled)
    IF v_previous_status <> p_new_status OR p_clear_proposed OR p_reschedule_date IS NOT NULL OR p_reschedule_start IS NOT NULL OR p_reschedule_service IS NOT NULL OR p_reschedule_doctor IS NOT NULL THEN
        INSERT INTO public.appointment_status_history (
            appointment_id,
            changed_by,
            actor_role,
            previous_status,
            new_status,
            reason
        ) VALUES (
            p_appointment_id,
            p_actor_id,
            p_actor_role,
            v_previous_status,
            p_new_status,
            p_reason
        );
    END IF;

    -- 5. Increment credibility metric (conditional on transition type)
    IF v_patient_id IS NOT NULL THEN
        IF p_new_status = 'CANCELLED'::public.appointment_status THEN
            PERFORM public.increment_credibility_metric(p_user_id := v_patient_id, p_metric := 'cancel_count'::text);
        ELSIF p_new_status = 'NO_SHOW'::public.appointment_status THEN
            PERFORM public.increment_credibility_metric(p_user_id := v_patient_id, p_metric := 'no_show_count'::text);
        ELSIF p_reschedule_date IS NOT NULL OR p_reschedule_count IS NOT NULL THEN
            -- Secretary directly rescheduling (actual slot changed)
            PERFORM public.increment_credibility_metric(p_user_id := v_patient_id, p_metric := 'reschedule_count'::text);
        END IF;
    END IF;

    RETURN NEXT v_updated_row;
END;
$$;
