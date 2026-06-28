-- Atomic Transaction for Cancelling an Appointment
-- Groups the state check, update, status history insertion, and user metric increment into a single ACID transaction.

CREATE OR REPLACE FUNCTION cancel_appointment_transaction(
    p_appointment_id UUID,
    p_actor_id UUID,
    p_actor_role TEXT,
    p_reason TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_status appointment_status;
    v_patient_id UUID;
    v_appointment RECORD;
    v_result JSONB;
BEGIN
    -- 1. Get and lock the appointment row
    SELECT * INTO v_appointment
    FROM appointments
    WHERE id = p_appointment_id
    FOR UPDATE;

    IF v_appointment IS NULL THEN
        RAISE EXCEPTION 'Appointment not found';
    END IF;

    v_current_status := v_appointment.status;
    v_patient_id := v_appointment.patient_id;

    -- 2. Check if already in terminal state
    IF v_current_status IN ('CANCELLED', 'REJECTED', 'COMPLETED', 'NO_SHOW') THEN
        RAISE EXCEPTION 'Cannot cancel appointment from terminal status: %', v_current_status;
    END IF;

    -- 3. Update appointment
    UPDATE appointments
    SET status = 'CANCELLED',
        status_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_appointment_id;

    -- 4. Insert ledger entry
    INSERT INTO appointment_status_history (
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
        v_current_status,
        'CANCELLED',
        p_reason
    );

    -- 5. Increment user cancel count
    IF v_patient_id IS NOT NULL THEN
        UPDATE users
        SET cancel_count = cancel_count + 1
        WHERE id = v_patient_id;
    END IF;

    -- 6. Fetch and return the updated appointment
    SELECT row_to_json(a)::jsonb INTO v_result
    FROM appointments a
    WHERE id = p_appointment_id;

    RETURN v_result;
END;
$$;
