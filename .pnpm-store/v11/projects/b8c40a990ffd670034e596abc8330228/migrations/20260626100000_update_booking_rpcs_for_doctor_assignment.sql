-- Migration: Update booking RPCs for doctor_assignment_source
-- Date: 2026-06-26

-- 1. Drop existing submit_booking_transaction to replace it
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
    p_new_dependent_relationship dependent_relationship,
    p_new_dependent_middle_name TEXT,
    p_new_dependent_suffix TEXT
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
    p_new_dependent_suffix TEXT DEFAULT NULL,
    p_doctor_assignment_source doctor_assignment_source DEFAULT 'SYSTEM'::doctor_assignment_source
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
        'dependentId', v_dependent_id
    );

    INSERT INTO outbox (event_type, payload, status)
    VALUES ('APPOINTMENT_BOOKED', v_outbox_payload, 'PENDING');

    RETURN v_appointment_id;
END;
$$;


-- 2. Drop existing create_manual_booking to replace it
DROP FUNCTION IF EXISTS public.create_manual_booking(
    UUID, UUID, UUID, DATE, TIMESTAMPTZ, TIMESTAMPTZ,
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID,
    UUID, TEXT, TEXT, TEXT, TEXT, DATE, TEXT
);

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
    p_new_dependent_relationship TEXT DEFAULT NULL,
    p_doctor_assignment_source public.doctor_assignment_source DEFAULT 'SYSTEM'::public.doctor_assignment_source
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
            p_new_dependent_relationship::public.dependent_relationship
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
        status_reason,
        doctor_assignment_source
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
        COALESCE(p_status_reason, 'Manually scheduled by staff'),
        p_doctor_assignment_source
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


-- 3. Drop existing convert_inquiry_to_appointment to replace it
DROP FUNCTION IF EXISTS public.convert_inquiry_to_appointment(
    UUID, UUID, UUID, DATE, TIMESTAMPTZ, TIMESTAMPTZ,
    TEXT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);

CREATE OR REPLACE FUNCTION public.convert_inquiry_to_appointment(
    p_inquiry_id UUID,
    p_service_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_patient_note TEXT,
    p_secretary_notes TEXT,
    p_secretary_user_id UUID,
    p_patient_id UUID DEFAULT NULL,
    p_first_name TEXT DEFAULT NULL,
    p_middle_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL,
    p_suffix TEXT DEFAULT NULL,
    p_phone_number TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_doctor_assignment_source public.doctor_assignment_source DEFAULT 'SYSTEM'::public.doctor_assignment_source
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_appointment_id UUID;
    v_guest_contact_id UUID;
    v_outbox_payload JSONB;
    v_duration INT;
    v_inquiry_first_name TEXT;
    v_inquiry_middle_name TEXT;
    v_inquiry_last_name TEXT;
    v_inquiry_suffix TEXT;
    v_inquiry_email TEXT;
    v_inquiry_phone TEXT;
    
    v_final_first_name TEXT;
    v_final_middle_name TEXT;
    v_final_last_name TEXT;
    v_final_suffix TEXT;
    v_final_phone TEXT;
    v_final_email TEXT;
BEGIN
    -- 1. Fetch guest inquiry information to validate it exists and is NEW
    SELECT first_name, middle_name, last_name, suffix, email, phone_number 
    INTO v_inquiry_first_name, v_inquiry_middle_name, v_inquiry_last_name, v_inquiry_suffix, v_inquiry_email, v_inquiry_phone
    FROM appointment_inquiries 
    WHERE id = p_inquiry_id AND status = 'NEW';

    IF v_inquiry_first_name IS NULL THEN
        RAISE EXCEPTION 'Inquiry not found or already converted/dropped';
    END IF;

    -- Use edited guest values if provided, otherwise fallback to inquiry values
    v_final_first_name := COALESCE(p_first_name, v_inquiry_first_name);
    v_final_middle_name := COALESCE(p_middle_name, v_inquiry_middle_name);
    v_final_last_name := COALESCE(p_last_name, v_inquiry_last_name);
    v_final_suffix := COALESCE(p_suffix, v_inquiry_suffix);
    v_final_phone := COALESCE(p_phone_number, v_inquiry_phone);
    v_final_email := COALESCE(p_email, v_inquiry_email);

    -- 2. Create the appointment directly in APPROVED state
    INSERT INTO appointments (
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
        status_reason,
        doctor_assignment_source
    ) VALUES (
        p_patient_id,
        NULL,
        p_service_id,
        p_doctor_id,
        p_date,
        p_start_time,
        p_end_time,
        'APPROVED'::appointment_status,
        'STAFF_CREATED'::appointment_source,
        p_patient_note,
        p_secretary_notes,
        p_doctor_assignment_source
    ) RETURNING id INTO v_appointment_id;

    -- Query duration from services
    SELECT duration_minutes INTO v_duration FROM services WHERE id = p_service_id;

    -- 3. Handle Guest Contact / Registered Patient branching
    IF p_patient_id IS NULL THEN
        -- Insert contact details in guest_contacts
        INSERT INTO guest_contacts (
            appointment_id,
            first_name,
            middle_name,
            last_name,
            suffix,
            phone_number,
            email
        ) VALUES (
            v_appointment_id,
            v_final_first_name,
            v_final_middle_name,
            v_final_last_name,
            v_final_suffix,
            v_final_phone,
            v_final_email
        ) RETURNING id INTO v_guest_contact_id;

        -- Emit outbox event for guest conversion
        v_outbox_payload := jsonb_build_object(
            'appointmentId', v_appointment_id,
            'serviceId', p_service_id,
            'doctorId', p_doctor_id,
            'date', p_date,
            'startTime', p_start_time,
            'durationMinutes', v_duration,
            'inquiryId', p_inquiry_id,
            'guestContactId', v_guest_contact_id,
            'guestName', v_final_first_name || COALESCE(' ' || v_final_middle_name, '') || ' ' || v_final_last_name || COALESCE(' ' || v_final_suffix, ''),
            'guestEmail', v_final_email,
            'guestPhone', v_final_phone
        );

        INSERT INTO outbox (event_type, payload, status)
        VALUES ('APPOINTMENT_CONVERTED_FROM_INQUIRY', v_outbox_payload, 'PENDING');
    ELSE
        -- Emit outbox event for registered patient conversion
        v_outbox_payload := jsonb_build_object(
            'appointmentId', v_appointment_id,
            'patientId', p_patient_id,
            'serviceId', p_service_id,
            'doctorId', p_doctor_id,
            'date', p_date,
            'startTime', p_start_time,
            'durationMinutes', v_duration,
            'inquiryId', p_inquiry_id
        );

        INSERT INTO outbox (event_type, payload, status)
        VALUES ('APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT', v_outbox_payload, 'PENDING');
    END IF;

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
