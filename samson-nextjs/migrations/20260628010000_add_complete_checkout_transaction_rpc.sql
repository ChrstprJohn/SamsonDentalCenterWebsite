-- Migration: Create complete_checkout_transaction RPC for atomic checkout
-- Date: 2026-06-28

CREATE OR REPLACE FUNCTION public.complete_checkout_transaction(
    p_invoice_id          UUID,
    p_payment_method      TEXT,
    p_discount_applied    NUMERIC,
    p_price_override      NUMERIC,
    p_actor_id            UUID
) RETURNS public.invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_appointment_id  UUID;
    v_previous_status public.appointment_status;
    v_updated_invoice public.invoices;
    v_reason          TEXT;
BEGIN
    -- 1. Fetch invoice info & check existence
    SELECT appointment_id
    INTO v_appointment_id
    FROM public.invoices
    WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice % not found', p_invoice_id;
    END IF;

    -- 2. Fetch appointment current status
    SELECT status
    INTO v_previous_status
    FROM public.appointments
    WHERE id = v_appointment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment % associated with invoice % not found', v_appointment_id, p_invoice_id;
    END IF;

    -- 3. Update invoice atomically, casting payment_method parameter to custom public.payment_method enum type
    UPDATE public.invoices
    SET
        status = 'FINALIZED',
        payment_method = p_payment_method::public.payment_method,
        discount_applied = COALESCE(p_discount_applied, discount_applied),
        amount = COALESCE(p_price_override, amount),
        updated_at = NOW()
    WHERE id = p_invoice_id
    RETURNING * INTO v_updated_invoice;

    -- 4. Update appointment to COMPLETED
    v_reason := 'Invoice finalized. Payment Method: ' || p_payment_method || '. Discount: ' || COALESCE(p_discount_applied, 0)::TEXT || '.';
    UPDATE public.appointments
    SET
        status = 'COMPLETED',
        status_reason = v_reason,
        updated_at = NOW()
    WHERE id = v_appointment_id;

    -- 5. Append ledger entry to appointment_status_history
    INSERT INTO public.appointment_status_history (
        appointment_id,
        changed_by,
        actor_role,
        previous_status,
        new_status,
        reason
    ) VALUES (
        v_appointment_id,
        p_actor_id,
        'STAFF',
        v_previous_status,
        'COMPLETED',
        v_reason
    );

    -- 6. Insert audit log (runs as SECURITY DEFINER bypasses RLS on audit_logs)
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        target_id,
        reason
    ) VALUES (
        p_actor_id,
        'CHECKOUT_COMPLETED',
        v_appointment_id,
        v_reason
    );

    RETURN v_updated_invoice;
END;
$$;
