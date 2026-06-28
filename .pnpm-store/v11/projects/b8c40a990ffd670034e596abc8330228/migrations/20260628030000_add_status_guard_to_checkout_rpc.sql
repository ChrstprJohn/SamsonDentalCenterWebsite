-- Migration: Add TREATMENT_RENDERED guard to complete_checkout_transaction RPC
-- Date: 2026-06-28
-- Fixes: complete_checkout_transaction had no guard on appointment prior status.
-- A duplicate/concurrent checkout call on the same invoice could flip an already-COMPLETED
-- appointment again. Now enforces appointment must be TREATMENT_RENDERED before proceeding.

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
    v_invoice_status  TEXT;
    v_updated_invoice public.invoices;
    v_reason          TEXT;
BEGIN
    -- 1. Fetch invoice info & check existence
    SELECT appointment_id, status
    INTO v_appointment_id, v_invoice_status
    FROM public.invoices
    WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice % not found', p_invoice_id;
    END IF;

    -- 2. Guard: invoice must still be DRAFT (idempotency / duplicate call protection)
    IF v_invoice_status <> 'DRAFT' THEN
        RAISE EXCEPTION
            'Invoice % is already % — checkout already completed or invoice is not in a checkable state.',
            p_invoice_id, v_invoice_status
            USING ERRCODE = 'P0002';
    END IF;

    -- 3. Fetch appointment current status
    SELECT status
    INTO v_previous_status
    FROM public.appointments
    WHERE id = v_appointment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment % associated with invoice % not found', v_appointment_id, p_invoice_id;
    END IF;

    -- 4. ACID guard: appointment must be TREATMENT_RENDERED to allow checkout.
    --    Prevents concurrent or duplicate checkout calls from double-completing.
    IF v_previous_status <> 'TREATMENT_RENDERED'::public.appointment_status THEN
        RAISE EXCEPTION
            'Concurrent status conflict on appointment %. Expected TREATMENT_RENDERED, found %.',
            v_appointment_id, v_previous_status
            USING ERRCODE = 'P0002';
    END IF;

    -- 5. Update invoice atomically, casting payment_method parameter to custom public.payment_method enum type
    UPDATE public.invoices
    SET
        status = 'FINALIZED',
        payment_method = p_payment_method::public.payment_method,
        discount_applied = COALESCE(p_discount_applied, discount_applied),
        amount = COALESCE(p_price_override, amount),
        updated_at = NOW()
    WHERE id = p_invoice_id
    RETURNING * INTO v_updated_invoice;

    -- 6. Update appointment to COMPLETED
    v_reason := 'Invoice finalized. Payment Method: ' || p_payment_method || '. Discount: ' || COALESCE(p_discount_applied, 0)::TEXT || '.';
    UPDATE public.appointments
    SET
        status = 'COMPLETED',
        status_reason = v_reason,
        updated_at = NOW()
    WHERE id = v_appointment_id;

    -- 7. Append ledger entry to appointment_status_history
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

    -- 8. Insert audit log (runs as SECURITY DEFINER bypasses RLS on audit_logs)
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
