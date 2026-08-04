-- Migration: Link initial inquiry outbox events to converted appointments
-- Date: 2026-08-04

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
        VALUES ('APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS', v_outbox_payload, 'PENDING');
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
        NULL,
        'APPROVED'::appointment_status,
        'Converted from Inquiry ID ' || p_inquiry_id::text
    );

    -- 5. Mark inquiry as CONVERTED and store linked appointment ID
    UPDATE appointment_inquiries
    SET status = 'CONVERTED',
        linked_appointment_id = v_appointment_id,
        updated_at = NOW()
    WHERE id = p_inquiry_id;

    -- 6. Link prior inquiry outbox logs to the created appointment
    UPDATE outbox
    SET appointment_id = v_appointment_id,
        payload = payload || jsonb_build_object('appointmentId', v_appointment_id)
    WHERE (payload->>'inquiryId' = p_inquiry_id::text OR payload->'inquiryId' = to_jsonb(p_inquiry_id::text))
      AND appointment_id IS NULL;

    RETURN v_appointment_id;
END;
$$;

-- Backfill past inquiry outbox entries for existing converted inquiries
UPDATE public.outbox o
SET appointment_id = ai.linked_appointment_id,
    payload = o.payload || jsonb_build_object('appointmentId', ai.linked_appointment_id)
FROM public.appointment_inquiries ai
WHERE o.appointment_id IS NULL
  AND ai.linked_appointment_id IS NOT NULL
  AND (o.payload->>'inquiryId' = ai.id::text OR o.payload->'inquiryId' = to_jsonb(ai.id::text));
