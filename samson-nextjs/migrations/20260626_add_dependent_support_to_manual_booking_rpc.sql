-- Migration: Add dependent support to create_manual_booking RPC
-- Date: 2026-06-26
-- Adds: p_dependent_id (existing), p_new_dependent_* (create inline)
-- Atomically handles: self booking, existing dependent, new dependent, guest

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
    p_secretary_user_id UUID,
    -- Dependent params (all default NULL for backwards compatibility)
    p_dependent_id UUID DEFAULT NULL,
    p_new_dependent_first_name TEXT DEFAULT NULL,
    p_new_dependent_middle_name TEXT DEFAULT NULL,
    p_new_dependent_last_name TEXT DEFAULT NULL,
    p_new_dependent_suffix TEXT DEFAULT NULL,
    p_new_dependent_date_of_birth DATE DEFAULT NULL,
    p_new_dependent_relationship TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_appointment_id UUID;
    v_guest_contact_id UUID;
    v_resolved_dependent_id UUID;
    v_dependent_name TEXT;
    v_outbox_payload JSONB;
    v_duration INT;
BEGIN
    -- Resolve dependent: existing or new inline creation
    IF p_dependent_id IS NOT NULL THEN
        -- Use existing dependent
        v_resolved_dependent_id := p_dependent_id;

        SELECT
            first_name || COALESCE(' ' || middle_name, '') || ' ' || last_name || COALESCE(' ' || suffix, '')
        INTO v_dependent_name
        FROM public.dependents
        WHERE id = p_dependent_id;

    ELSIF p_new_dependent_first_name IS NOT NULL THEN
        -- Create new dependent atomically
        INSERT INTO public.dependents (
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
        ) RETURNING id INTO v_resolved_dependent_id;

        v_dependent_name := p_new_dependent_first_name
            || COALESCE(' ' || p_new_dependent_middle_name, '')
            || ' ' || p_new_dependent_last_name
            || COALESCE(' ' || p_new_dependent_suffix, '');
    END IF;

    -- 1. Create the appointment in APPROVED state
    INSERT INTO public.appointments (
        patient_id,
        dependent_id,
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
        v_resolved_dependent_id,
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

    -- 2. Branch on guest vs registered patient
    IF p_patient_id IS NULL THEN
        -- Guest mode: snapshot contact in guest_contacts
        INSERT INTO public.guest_contacts (
            appointment_id,
            first_name,
            middle_name,
            last_name,
            suffix,
            phone_number,
            email
        ) VALUES (
            v_appointment_id,
            p_first_name,
            p_middle_name,
            p_last_name,
            p_suffix,
            p_phone_number,
            p_email
        ) RETURNING id INTO v_guest_contact_id;

        v_outbox_payload := jsonb_build_object(
            'appointmentId', v_appointment_id,
            'serviceId', p_service_id,
            'doctorId', p_doctor_id,
            'date', p_date,
            'startTime', p_start_time,
            'durationMinutes', v_duration,
            'guestContactId', v_guest_contact_id,
            'guestName', p_first_name || COALESCE(' ' || p_middle_name, '') || ' ' || p_last_name || COALESCE(' ' || p_suffix, ''),
            'guestEmail', p_email,
            'guestPhone', p_phone_number
        );

        INSERT INTO public.outbox (event_type, payload, status)
        VALUES ('APPOINTMENT_MANUALLY_BOOKED_GUEST', v_outbox_payload, 'PENDING');
    ELSE
        -- Registered patient (booking for self or dependent)
        v_outbox_payload := jsonb_build_object(
            'appointmentId', v_appointment_id,
            'patientId', p_patient_id,
            'serviceId', p_service_id,
            'doctorId', p_doctor_id,
            'date', p_date,
            'startTime', p_start_time,
            'durationMinutes', v_duration,
            'dependentId', v_resolved_dependent_id,
            'dependentName', v_dependent_name
        );

        INSERT INTO public.outbox (event_type, payload, status)
        VALUES ('APPOINTMENT_MANUALLY_BOOKED_PATIENT', v_outbox_payload, 'PENDING');
    END IF;

    -- 3. Insert initial APPROVED ledger entry
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
