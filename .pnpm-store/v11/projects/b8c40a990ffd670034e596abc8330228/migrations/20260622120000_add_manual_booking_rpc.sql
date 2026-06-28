-- Migration: Add manual booking RPC function
-- Date: 2026-06-22

CREATE OR REPLACE FUNCTION public.create_manual_booking(
    p_patient_id UUID,
    p_service_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_first_name TEXT,
    p_middle_name TEXT,
    p_last_name TEXT,
    p_suffix TEXT,
    p_phone_number TEXT,
    p_email TEXT,
    p_patient_note TEXT,
    p_status_reason TEXT,
    p_secretary_user_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_appointment_id UUID;
    v_inquiry_id UUID;
    v_outbox_payload JSONB;
    v_duration INT;
BEGIN
    -- 1. Create the appointment directly in APPROVED state
    INSERT INTO public.appointments (
        patient_id,
        dependent_id, -- NULL
        service_id,
        doctor_id,
        date,
        start_time,
        end_time,
        status,
        source,
        user_note,
        status_reason
    ) VALUES (
        p_patient_id,
        NULL,
        p_service_id,
        p_doctor_id,
        p_date,
        p_start_time,
        p_end_time,
        'APPROVED'::public.appointment_status,
        'STAFF_CREATED'::public.appointment_source,
        p_patient_note,
        p_status_reason
    ) RETURNING id INTO v_appointment_id;

    -- Query duration from services
    SELECT duration_minutes INTO v_duration FROM public.services WHERE id = p_service_id;

    -- 2. If guest mode (no patient account), snapshot guest details in appointment_inquiries
    IF p_patient_id IS NULL THEN
        INSERT INTO public.appointment_inquiries (
            first_name,
            middle_name,
            last_name,
            suffix,
            phone_number,
            email,
            preferred_service_id,
            preferred_date,
            patient_note,
            status,
            secretary_notes,
            linked_appointment_id
        ) VALUES (
            p_first_name,
            p_middle_name,
            p_last_name,
            p_suffix,
            p_phone_number,
            COALESCE(p_email, ''),
            p_service_id,
            p_date,
            p_patient_note,
            'CONVERTED'::public.inquiry_status,
            p_status_reason,
            v_appointment_id
        ) RETURNING id INTO v_inquiry_id;

        -- Emit outbox event for guest manual booking
        v_outbox_payload := jsonb_build_object(
            'appointmentId', v_appointment_id,
            'serviceId', p_service_id,
            'doctorId', p_doctor_id,
            'date', p_date,
            'startTime', p_start_time,
            'durationMinutes', v_duration,
            'inquiryId', v_inquiry_id,
            'guestName', p_first_name || COALESCE(' ' || p_middle_name, '') || ' ' || p_last_name || COALESCE(' ' || p_suffix, ''),
            'guestEmail', p_email,
            'guestPhone', p_phone_number
        );

        INSERT INTO public.outbox (event_type, payload, status)
        VALUES ('APPOINTMENT_MANUALLY_BOOKED_GUEST', v_outbox_payload, 'PENDING');
    ELSE
        -- Emit outbox event for registered patient manual booking
        v_outbox_payload := jsonb_build_object(
            'appointmentId', v_appointment_id,
            'patientId', p_patient_id,
            'serviceId', p_service_id,
            'doctorId', p_doctor_id,
            'date', p_date,
            'startTime', p_start_time,
            'durationMinutes', v_duration
        );

        INSERT INTO public.outbox (event_type, payload, status)
        VALUES ('APPOINTMENT_MANUALLY_BOOKED_PATIENT', v_outbox_payload, 'PENDING');
    END IF;

    -- 3. Insert initial APPROVED ledger entry in appointment history
    INSERT INTO public.appointment_status_history (
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
        'APPROVED'::public.appointment_status,
        COALESCE(p_status_reason, 'Manually scheduled by staff')
    );

    RETURN v_appointment_id;
END;
$$;
