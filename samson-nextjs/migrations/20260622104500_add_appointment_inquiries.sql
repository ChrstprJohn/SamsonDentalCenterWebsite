-- Migration: Add Two-Pronged Booking Flow structures
-- Date: 2026-06-22

-- 1. Create Enums
CREATE TYPE public.inquiry_status AS ENUM ('NEW', 'CONVERTED', 'DROPPED');
CREATE TYPE public.appointment_source AS ENUM ('SELF_BOOKED', 'STAFF_CREATED');

-- 2. Create appointment_inquiries table
CREATE TABLE public.appointment_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    suffix TEXT,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    preferred_service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT NOT NULL,
    preferred_date DATE NOT NULL,
    patient_note TEXT,
    status public.inquiry_status DEFAULT 'NEW'::public.inquiry_status NOT NULL,
    secretary_notes TEXT,
    linked_appointment_id UUID, -- We'll add the foreign key constraint after altering appointments table
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Modify appointments table
-- Add source column
ALTER TABLE public.appointments ADD COLUMN source public.appointment_source DEFAULT 'SELF_BOOKED'::public.appointment_source NOT NULL;

-- Make patient_id nullable
ALTER TABLE public.appointments ALTER COLUMN patient_id DROP NOT NULL;

-- Add foreign key constraint to appointment_inquiries linking to appointments
ALTER TABLE public.appointment_inquiries
ADD CONSTRAINT fk_linked_appointment
FOREIGN KEY (linked_appointment_id)
REFERENCES public.appointments(id)
ON DELETE SET NULL;

-- 4. Enable Row Level Security (RLS) on appointment_inquiries
ALTER TABLE public.appointment_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public insert (unauthenticated guests submitting the landing page form)
CREATE POLICY "Allow public insert to appointment_inquiries"
ON public.appointment_inquiries
FOR INSERT
WITH CHECK (true);

-- Restrict select/write access to SECRETARY and ADMIN roles
CREATE POLICY "Allow select/write access to staff users"
ON public.appointment_inquiries
FOR ALL
TO authenticated
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
)
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);

-- 5. Trigger for updated_at column on appointment_inquiries
CREATE TRIGGER update_appointment_inquiries_modtime 
BEFORE UPDATE ON public.appointment_inquiries 
FOR EACH ROW 
EXECUTE FUNCTION public.update_modified_column();
