-- Migration: Create guest_contacts table
-- Date: 2026-06-22
-- Purpose: Clean, dedicated storage for guest contact details on manually booked appointments.
-- Replaces the abuse of appointment_inquiries as a guest contact store.
-- appointment_inquiries remains purpose-pure for public form submissions only.

CREATE TABLE IF NOT EXISTS public.guest_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    suffix TEXT,
    phone_number TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One guest contact per appointment
CREATE UNIQUE INDEX IF NOT EXISTS guest_contacts_appointment_id_idx
    ON public.guest_contacts(appointment_id);

-- RLS: Only authenticated staff can read/write guest contacts
ALTER TABLE public.guest_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage guest contacts"
    ON public.guest_contacts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('SECRETARY', 'ADMIN', 'DOCTOR')
        )
    );
