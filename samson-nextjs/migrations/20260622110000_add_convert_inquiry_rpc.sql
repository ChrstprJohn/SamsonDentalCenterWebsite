-- Migration: Add convert_inquiry_to_appointment RPC function
-- Date: 2026-06-22

CREATE OR REPLACE FUNCTION public.convert_inquiry_to_appointment(
    p_inquiry_id UUID,
    p_service_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_patient_note TEXT,
    p_secretary_notes TEXT,
    p_secretary_user_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_appointment_id UUID;
    v_outbox_payload JSONB;
    v_duration INT;
    v_inquiry_first_name TEXT;
    v_inquiry_last_name TEXT;
    v_inquiry_email TEXT;
    v_inquiry_phone TEXT;
BEGIN
    -- 1. Fetch guest inquiry information to snapshot on creation
    SELECT first_name, last_name, email, phone_number 
    INTO v_inquiry_first_name, v_inquiry_last_name, v_inquiry_email, v_inquiry_phone
    FROM appointment_inquiries 
    WHERE id = p_inquiry_id AND status = 'NEW';

    IF v_inquiry_first_name IS NULL THEN
        RAISE EXCEPTION 'Inquiry not found or already converted/dropped';
    END IF;

    -- 2. Create the appointment directly in APPROVED state
    INSERT INTO appointments (
        patient_id, -- NULL for guest/anonymous
        dependent_id, -- NULL
        service_id,
        doctor_id,
        date,
        start_time,
        end_time,
        status,
        source,
        user_note, -- Snapshot patient's landing page note
        status_reason -- Secretary's conversation notes
    ) VALUES (
        NULL,
        NULL,
        p_service_id,
        p_doctor_id,
        p_date,
        p_start_time,
        p_end_time,
        'APPROVED'::appointment_status,
        'STAFF_CREATED'::appointment_source,
        p_patient_note,
        p_secretary_notes
    ) RETURNING id INTO v_appointment_id;

    -- Query duration from services
    SELECT duration_minutes INTO v_duration FROM services WHERE id = p_service_id;

    -- 3. Emit outbox event for async guest email notifications
    v_outbox_payload := jsonb_build_object(
        'appointmentId', v_appointment_id,
        'serviceId', p_service_id,
        'doctorId', p_doctor_id,
        'date', p_date,
        'startTime', p_start_time,
        'durationMinutes', v_duration,
        'inquiryId', p_inquiry_id,
        'guestName', v_inquiry_first_name || ' ' || v_inquiry_last_name,
        'guestEmail', v_inquiry_email,
        'guestPhone', v_inquiry_phone
    );

    INSERT INTO outbox (event_type, payload, status)
    VALUES ('APPOINTMENT_CONVERTED_FROM_INQUIRY', v_outbox_payload, 'PENDING');

    -- 4. Insert initial APPROVED ledger entry in appointment history
    INSERT INTO appointment_status_history (
        appointment_id, 
        changed_by, 
        actor_role,
        previous_status, 
        new_status, 
        reason
    ) VALUES (
        v_appointment_id,
        p_secretary_user_id,
        'SECRETARY',
        NULL,
        'APPROVED'::appointment_status,
        COALESCE(p_secretary_notes, 'Inquiry converted to confirmed appointment')
    );

    -- 5. Mark inquiry as CONVERTED and link the appointment
    UPDATE appointment_inquiries
    SET status = 'CONVERTED'::inquiry_status,
        linked_appointment_id = v_appointment_id,
        patient_note = p_patient_note,
        secretary_notes = p_secretary_notes,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_inquiry_id;

    RETURN v_appointment_id;
END;
$$;
