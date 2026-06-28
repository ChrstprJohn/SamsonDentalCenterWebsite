-- Migration: Create invoice_items table and upgrade complete_checkout_transaction RPC
-- Date: 2026-06-28

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_item_source') THEN
        CREATE TYPE public.invoice_item_source AS ENUM ('DOCTOR_BASELINE', 'SECRETARY_ADDITION');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    source public.invoice_item_source NOT NULL DEFAULT 'DOCTOR_BASELINE'::public.invoice_item_source,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Allow select for owners and staff on invoice_items" ON public.invoice_items;
CREATE POLICY "Allow select for owners and staff on invoice_items"
ON public.invoice_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    JOIN public.appointments a ON a.id = i.appointment_id
    WHERE i.id = invoice_items.invoice_id
      AND (
        a.patient_id = auth.uid() OR
        ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
      )
  )
);

DROP POLICY IF EXISTS "Allow insert for staff on invoice_items" ON public.invoice_items;
CREATE POLICY "Allow insert for staff on invoice_items"
ON public.invoice_items
FOR INSERT
TO authenticated
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
);

DROP POLICY IF EXISTS "Allow update for staff on invoice_items" ON public.invoice_items;
CREATE POLICY "Allow update for staff on invoice_items"
ON public.invoice_items
FOR UPDATE
TO authenticated
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
)
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);

DROP POLICY IF EXISTS "Allow delete for staff on invoice_items" ON public.invoice_items;
CREATE POLICY "Allow delete for staff on invoice_items"
ON public.invoice_items
FOR DELETE
TO authenticated
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);

-- Populate existing invoices
INSERT INTO public.invoice_items (invoice_id, service_id, description, unit_price, quantity, source, created_at)
SELECT 
    i.id, 
    a.service_id, 
    s.name, 
    i.amount, 
    1, 
    'DOCTOR_BASELINE'::public.invoice_item_source, 
    i.created_at
FROM public.invoices i
JOIN public.appointments a ON a.id = i.appointment_id
JOIN public.services s ON s.id = a.service_id
WHERE NOT EXISTS (
    SELECT 1 FROM public.invoice_items ii WHERE ii.invoice_id = i.id
);

-- Drop old function first to avoid signature conflicts if arguments changed
DROP FUNCTION IF EXISTS public.complete_checkout_transaction(UUID, TEXT, NUMERIC, NUMERIC, UUID);

CREATE OR REPLACE FUNCTION public.complete_checkout_transaction(
    p_invoice_id          UUID,
    p_payment_method      TEXT,
    p_discount_percent    NUMERIC,
    p_actor_id            UUID,
    p_additional_items    JSONB DEFAULT '[]'
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
    v_item            JSONB;
    v_subtotal        NUMERIC(10, 2) := 0;
    v_discount_amount NUMERIC(10, 2) := 0;
    v_total_amount    NUMERIC(10, 2) := 0;
BEGIN
    -- 1. Fetch invoice info & check existence
    SELECT appointment_id, status
    INTO v_appointment_id, v_invoice_status
    FROM public.invoices
    WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice % not found', p_invoice_id;
    END IF;

    -- 2. Guard: invoice must still be DRAFT
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

    -- 4. ACID guard
    IF v_previous_status <> 'TREATMENT_RENDERED'::public.appointment_status THEN
        RAISE EXCEPTION
            'Concurrent status conflict on appointment %. Expected TREATMENT_RENDERED, found %.',
            v_appointment_id, v_previous_status
            USING ERRCODE = 'P0002';
    END IF;

    -- 5. Insert additional items if any
    IF p_additional_items IS NOT NULL AND jsonb_array_length(p_additional_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_additional_items) LOOP
            INSERT INTO public.invoice_items (
                invoice_id,
                service_id,
                description,
                unit_price,
                quantity,
                source
            ) VALUES (
                p_invoice_id,
                (v_item->>'serviceId')::UUID,
                v_item->>'description',
                (v_item->>'unitPrice')::NUMERIC,
                (v_item->>'quantity')::INT,
                'SECRETARY_ADDITION'::public.invoice_item_source
            );
        END LOOP;
    END IF;

    -- 6. Calculate total amount
    SELECT COALESCE(SUM(unit_price * quantity), 0)
    INTO v_subtotal
    FROM public.invoice_items
    WHERE invoice_id = p_invoice_id;

    v_discount_amount := v_subtotal * (COALESCE(p_discount_percent, 0) / 100.0);
    v_total_amount := GREATEST(0, v_subtotal - v_discount_amount);

    -- 7. Update invoice atomically
    UPDATE public.invoices
    SET
        status = 'FINALIZED',
        payment_method = p_payment_method::public.payment_method,
        discount_applied = v_discount_amount,
        amount = v_total_amount,
        updated_at = NOW()
    WHERE id = p_invoice_id
    RETURNING * INTO v_updated_invoice;

    -- 8. Update appointment to COMPLETED
    v_reason := 'Invoice finalized. Payment Method: ' || p_payment_method || '. Discount: ' || COALESCE(p_discount_percent, 0)::TEXT || '%. Total: ₱' || v_total_amount::TEXT || '.';
    UPDATE public.appointments
    SET
        status = 'COMPLETED',
        status_reason = v_reason,
        updated_at = NOW()
    WHERE id = v_appointment_id;

    -- 9. Append ledger entry
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

    -- 10. Insert audit log
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
