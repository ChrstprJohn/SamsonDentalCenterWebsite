-- Migration: Add Time Preference to Appointments and update RPCs
-- Date: 2026-07-11

-- 1. Alter appointments table to add time_preference and proposed_time_preference columns
ALTER TABLE public.appointments ADD COLUMN time_preference TEXT;
ALTER TABLE public.appointments ADD CONSTRAINT check_appointments_time_preference CHECK (time_preference IN ('MORNING', 'AFTERNOON'));

ALTER TABLE public.appointments ADD COLUMN proposed_time_preference TEXT;
ALTER TABLE public.appointments ADD CONSTRAINT check_appointments_proposed_time_preference CHECK (proposed_time_preference IN ('MORNING', 'AFTERNOON'));

-- 2. Allow start_time and end_time to be nullable for pending appointments and update exclusion constraint
ALTER TABLE public.appointments ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN end_time DROP NOT NULL;

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS no_overlapping_appointments;
ALTER TABLE public.appointments ADD CONSTRAINT no_overlapping_appointments EXCLUDE USING gist (
    doctor_id WITH =,
    tstzrange(start_time, end_time) WITH &&
) WHERE (status != 'PENDING' AND status != 'RESCHEDULE_REQUESTED');

-- 3. Recreate submit_booking_transaction to accept time_preference
DROP FUNCTION IF EXISTS public.submit_booking_transaction(
    UUID, UUID, UUID, DATE, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, UUID, TEXT, TEXT, DATE, dependent_relationship, TEXT, TEXT, doctor_assignment_source
);

CREATE OR REPLACE FUNCTION public.submit_booking_transaction(
    p_patient_id UUID,
    p_service_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_start_time TIMESTAMPTZ DEFAULT NULL,
    p_end_time TIMESTAMPTZ DEFAULT NULL,
    p_user_note TEXT DEFAULT NULL,
    p_existing_dependent_id UUID DEFAULT NULL,
    p_new_dependent_first_name TEXT DEFAULT NULL,
    p_new_dependent_last_name TEXT DEFAULT NULL,
    p_new_dependent_date_of_birth DATE DEFAULT NULL,
    p_new_dependent_relationship dependent_relationship DEFAULT NULL,
    p_new_dependent_middle_name TEXT DEFAULT NULL,
    p_new_dependent_suffix TEXT DEFAULT NULL,
    p_doctor_assignment_source doctor_assignment_source DEFAULT 'SYSTEM'::doctor_assignment_source,
    p_time_preference TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_dependent_id UUID := p_existing_dependent_id;
    v_appointment_id UUID;
    v_outbox_payload JSONB;
    v_duration INT; 
BEGIN
    -- 1. Create dependent if new dependent data is provided
    IF p_new_dependent_first_name IS NOT NULL AND p_new_dependent_last_name IS NOT NULL THEN
        INSERT INTO dependents (
            patient_id, 
            first_name, 
            middle_name,
            last_name, 
            suffix,
            date_of_birth, 
            relationship
        ) VALUES (
            p_patient_id, 
            p_new_dependent_first_name, 
            p_new_dependent_middle_name,
            p_new_dependent_last_name, 
            p_new_dependent_suffix,
            p_new_dependent_date_of_birth, 
            p_new_dependent_relationship
        ) RETURNING id INTO v_dependent_id;
    END IF;

    -- 2. Create appointment
    INSERT INTO appointments (
        patient_id,
        dependent_id,
        service_id,
        doctor_id,
        date,
        start_time,
        end_time,
        time_preference,
        user_note,
        status,
        doctor_assignment_source
    ) VALUES (
        p_patient_id,
        v_dependent_id,
        p_service_id,
        p_doctor_id,
        p_date,
        p_start_time,
        p_end_time,
        p_time_preference,
        p_user_note,
        'PENDING',
        p_doctor_assignment_source
    ) RETURNING id INTO v_appointment_id;

    -- Query duration from services
    SELECT duration_minutes INTO v_duration FROM services WHERE id = p_service_id;

    -- 3. Emit outbox event in the same transaction
    v_outbox_payload := jsonb_build_object(
        'appointmentId', v_appointment_id,
        'patientId', p_patient_id,
        'serviceId', p_service_id,
        'doctorId', p_doctor_id,
        'date', p_date,
        'startTime', p_start_time,
        'durationMinutes', v_duration,
        'dependentId', v_dependent_id,
        'timePreference', p_time_preference
    );

    INSERT INTO outbox (event_type, payload, status)
    VALUES ('APPOINTMENT_BOOKED', v_outbox_payload, 'PENDING');

    RETURN v_appointment_id;
END;
$$;

-- 4. Recreate request_reschedule_transaction to accept time_preference
DROP FUNCTION IF EXISTS public.request_reschedule_transaction(
    UUID, UUID, TEXT, TEXT, DATE, TIMESTAMPTZ, TIMESTAMPTZ, UUID
);

CREATE OR REPLACE FUNCTION public.request_reschedule_transaction(
    p_appointment_id UUID,
    p_actor_id       UUID,
    p_actor_role     TEXT,
    p_reason         TEXT,
    p_proposed_date  DATE,
    p_proposed_start_time TIMESTAMPTZ DEFAULT NULL,
    p_proposed_end_time   TIMESTAMPTZ DEFAULT NULL,
    p_proposed_doctor_id  UUID DEFAULT NULL,
    p_proposed_time_preference TEXT DEFAULT NULL
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
    -- 1. Fetch current status and patient_id (also acts as existence check)
    SELECT status, patient_id
    INTO v_previous_status, v_patient_id
    FROM public.appointments
    WHERE id = p_appointment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment % not found', p_appointment_id;
    END IF;

    -- 2. Update appointment status and store proposed schedule atomically
    UPDATE public.appointments
    SET
        status                     = 'RESCHEDULE_REQUESTED'::public.appointment_status,
        status_reason              = p_reason,
        reschedule_count           = COALESCE(reschedule_count, 0) + 1,
        proposed_date              = p_proposed_date,
        proposed_start_time        = p_proposed_start_time,
        proposed_end_time          = p_proposed_end_time,
        proposed_doctor_id         = p_proposed_doctor_id,
        proposed_time_preference   = p_proposed_time_preference,
        updated_at                 = NOW()
    WHERE id = p_appointment_id
    RETURNING * INTO v_updated_row;

    -- 3. Append ledger history entry (only if not already in RESCHEDULE_REQUESTED)
    IF v_previous_status <> 'RESCHEDULE_REQUESTED'::public.appointment_status THEN
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
            'RESCHEDULE_REQUESTED'::public.appointment_status,
            p_reason
        );
    END IF;

    -- 4. Increment reschedule credibility metric for the patient
    IF v_patient_id IS NOT NULL THEN
        PERFORM public.increment_credibility_metric(p_user_id := v_patient_id, p_metric := 'reschedule_count'::text);
    END IF;

    RETURN NEXT v_updated_row;
END;
$$;
