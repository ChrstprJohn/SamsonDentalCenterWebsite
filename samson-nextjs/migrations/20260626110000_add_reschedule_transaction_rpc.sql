-- Migration: Add request_reschedule_transaction RPC
-- Date: 2026-06-26
-- Replaces 3 non-atomic app-layer calls with a single ACID transaction

CREATE OR REPLACE FUNCTION public.request_reschedule_transaction(
    p_appointment_id UUID,
    p_actor_id       UUID,
    p_actor_role     TEXT,
    p_reason         TEXT,
    p_proposed_date  DATE,
    p_proposed_start_time TIMESTAMPTZ,
    p_proposed_end_time   TIMESTAMPTZ,
    p_proposed_doctor_id  UUID
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
        status                = 'RESCHEDULE_REQUESTED'::public.appointment_status,
        status_reason         = p_reason,
        reschedule_count      = COALESCE(reschedule_count, 0) + 1,
        proposed_date         = p_proposed_date,
        proposed_start_time   = p_proposed_start_time,
        proposed_end_time     = p_proposed_end_time,
        proposed_doctor_id    = p_proposed_doctor_id,
        updated_at            = NOW()
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
        PERFORM public.increment_credibility_metric(v_patient_id, 'reschedule_count');
    END IF;

    RETURN NEXT v_updated_row;
END;
$$;
