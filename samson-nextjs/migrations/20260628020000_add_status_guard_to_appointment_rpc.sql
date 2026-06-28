-- Migration: Add p_expected_status guard to update_appointment_status_transaction RPC
-- Date: 2026-06-28
-- Fixes: Read-then-act race condition where two concurrent requests could both pass
-- the app-layer status check and both succeed. The RPC now re-validates the
-- current status inside the DB transaction before updating, making it idempotent-safe.

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

    -- 4. Append ledger entry (only if status changed OR proposed metadata was cleared)
    IF v_previous_status <> p_new_status OR p_clear_proposed THEN
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
