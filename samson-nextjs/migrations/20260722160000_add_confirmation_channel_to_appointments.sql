-- Migration: Add confirmation_channel to appointments and update RPCs

-- 1. Add confirmation_channel column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS confirmation_channel TEXT NOT NULL DEFAULT 'EMAIL';

-- 2. Update create_manual_booking RPC to save confirmation_channel column
CREATE OR REPLACE FUNCTION public.create_manual_booking(
    p_patient_id UUID,
    p_service_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_first_name TEXT DEFAULT NULL,
    p_middle_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL,
    p_suffix TEXT DEFAULT NULL,
    p_phone_number TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_patient_note TEXT DEFAULT NULL,
    p_status_reason TEXT DEFAULT NULL,
    p_secretary_user_id UUID DEFAULT NULL,
    p_dependent_id UUID DEFAULT NULL,
    p_new_dependent_first_name TEXT DEFAULT NULL,
    p_new_dependent_middle_name TEXT DEFAULT NULL,
    p_new_dependent_last_name TEXT DEFAULT NULL,
    p_new_dependent_suffix TEXT DEFAULT NULL,
    p_new_dependent_date_of_birth DATE DEFAULT NULL,
    p_new_dependent_relationship TEXT DEFAULT NULL,
    p_doctor_assignment_source public.doctor_assignment_source DEFAULT 'SYSTEM'::public.doctor_assignment_source,
    p_confirmation_channel TEXT DEFAULT 'EMAIL'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_appointment_id UUID;
    v_guest_contact_id UUID;
    v_resolved_dependent_id UUID;
    v_outbox_payload JSONB;
    v_duration INT;
    v_patient_name TEXT;
    v_phone_number TEXT;
    v_dependent_name TEXT;
    v_effective_channel TEXT;
    v_service_name TEXT;
BEGIN
    v_effective_channel := COALESCE(p_confirmation_channel, 'EMAIL');

    -- Resolve or create dependent if provided
    IF p_dependent_id IS NOT NULL THEN
        v_resolved_dependent_id := p_dependent_id;
        SELECT first_name || ' ' || last_name INTO v_dependent_name
        FROM public.dependents WHERE id = p_dependent_id;
    ELSIF p_new_dependent_first_name IS NOT NULL AND p_patient_id IS NOT NULL THEN
        INSERT INTO public.dependents (
            patient_id, first_name, middle_name, last_name, suffix, date_of_birth, relationship
        ) VALUES (
            p_patient_id, p_new_dependent_first_name, p_new_dependent_middle_name,
            p_new_dependent_last_name, p_new_dependent_suffix, p_new_dependent_date_of_birth,
            p_new_dependent_relationship
        ) RETURNING id INTO v_resolved_dependent_id;

        v_dependent_name := p_new_dependent_first_name || ' ' || p_new_dependent_last_name;
    END IF;

    -- Query duration from services
    SELECT duration_minutes INTO v_duration FROM public.services WHERE id = p_service_id;

    -- 1. Create the appointment directly in APPROVED state
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
        doctor_assignment_source,
        confirmation_channel
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
        p_status_reason,
        p_doctor_assignment_source,
        v_effective_channel
    ) RETURNING id INTO v_appointment_id;

    -- Handle Guest Contact if not linked to registered patient
    IF p_patient_id IS NULL THEN
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
    END IF;

    -- Resolve contact details for notifications
    IF p_patient_id IS NOT NULL THEN
        SELECT first_name || ' ' || last_name, phone_number
        INTO v_patient_name, v_phone_number
        FROM public.users
        WHERE id = p_patient_id;
        IF v_resolved_dependent_id IS NOT NULL THEN
            v_patient_name := v_dependent_name;
        END IF;
    ELSE
        v_patient_name := p_first_name || COALESCE(' ' || p_middle_name, '') || ' ' || p_last_name || COALESCE(' ' || p_suffix, '');
        v_phone_number := p_phone_number;
    END IF;

    SELECT name INTO v_service_name FROM public.services WHERE id = p_service_id;

    -- 2. Emit outbox event conditionally based on chosen channel
    IF v_effective_channel IN ('SMS', 'BOTH') THEN
        v_outbox_payload := jsonb_build_object(
            'appointmentId', v_appointment_id,
            'patientName', v_patient_name,
            'phoneNumber', v_phone_number,
            'date', p_date,
            'startTime', p_start_time,
            'serviceName', v_service_name
        );
        INSERT INTO public.outbox (event_type, payload, status)
        VALUES ('APPOINTMENT_MANUALLY_BOOKED_SMS', v_outbox_payload, 'PENDING');
    END IF;

    IF v_effective_channel IN ('EMAIL', 'BOTH') THEN
        IF p_patient_id IS NULL THEN
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

-- 3. Update convert_inquiry_to_appointment RPC to accept and save p_confirmation_channel
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
    p_doctor_assignment_source public.doctor_assignment_source DEFAULT 'SYSTEM'::public.doctor_assignment_source,
    p_confirmation_channel TEXT DEFAULT 'EMAIL'
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
    v_effective_channel TEXT;
BEGIN
    v_effective_channel := COALESCE(p_confirmation_channel, 'EMAIL');

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
        doctor_assignment_source,
        confirmation_channel
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
        p_doctor_assignment_source,
        v_effective_channel
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
    END IF;

    -- Emit outbox events based on confirmation channel
    IF v_effective_channel IN ('SMS', 'BOTH') THEN
        v_outbox_payload := jsonb_build_object(
            'appointmentId', v_appointment_id,
            'patientName', v_final_first_name || COALESCE(' ' || v_final_middle_name, '') || ' ' || v_final_last_name || COALESCE(' ' || v_final_suffix, ''),
            'phoneNumber', v_final_phone,
            'date', p_date,
            'startTime', p_start_time
        );
        INSERT INTO outbox (event_type, payload, status)
        VALUES ('APPOINTMENT_MANUALLY_BOOKED_SMS', v_outbox_payload, 'PENDING');
    END IF;

    IF v_effective_channel IN ('EMAIL', 'BOTH') THEN
        IF p_patient_id IS NULL THEN
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
        'NEW'::appointment_status,
        'APPROVED'::appointment_status,
        'Converted from Inquiry ID ' || p_inquiry_id::text
    );

    -- 5. Mark inquiry as CONVERTED
    UPDATE appointment_inquiries
    SET status = 'CONVERTED',
        updated_at = NOW()
    WHERE id = p_inquiry_id;

    RETURN v_appointment_id;
END;
$$;
