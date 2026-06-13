-- Update submit_booking_transaction to support new dependent middle name and suffix
DROP FUNCTION IF EXISTS submit_booking_transaction(
    p_patient_id UUID,
    p_service_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_user_note TEXT,
    p_existing_dependent_id UUID,
    p_new_dependent_first_name TEXT,
    p_new_dependent_last_name TEXT,
    p_new_dependent_date_of_birth DATE,
    p_new_dependent_relationship dependent_relationship
);

CREATE OR REPLACE FUNCTION submit_booking_transaction(
    p_patient_id UUID,
    p_service_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_user_note TEXT,
    p_existing_dependent_id UUID DEFAULT NULL,
    p_new_dependent_first_name TEXT DEFAULT NULL,
    p_new_dependent_last_name TEXT DEFAULT NULL,
    p_new_dependent_date_of_birth DATE DEFAULT NULL,
    p_new_dependent_relationship dependent_relationship DEFAULT NULL,
    p_new_dependent_middle_name TEXT DEFAULT NULL,
    p_new_dependent_suffix TEXT DEFAULT NULL
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
        user_note,
        status
    ) VALUES (
        p_patient_id,
        v_dependent_id,
        p_service_id,
        p_doctor_id,
        p_date,
        p_start_time,
        p_end_time,
        p_user_note,
        'PENDING'
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
        'dependentId', v_dependent_id
    );

    INSERT INTO outbox (event_type, payload, status)
    VALUES ('APPOINTMENT_BOOKED', v_outbox_payload, 'PENDING');

    RETURN v_appointment_id;
END;
$$;
