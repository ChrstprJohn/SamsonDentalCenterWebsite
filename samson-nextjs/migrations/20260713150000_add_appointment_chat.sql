-- Migration: Add appointment chat system tables and policies
-- Date: 2026-07-13
-- Purpose: Add secure guest chat token and messaging tables

-- 1. Alter appointments table to add chat_token
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS chat_token TEXT DEFAULT uuid_generate_v4()::text;

-- 2. Create appointment_messages table
CREATE TABLE IF NOT EXISTS public.appointment_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('PATIENT', 'STAFF')),
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- 3. Create index for fast retrieval
CREATE INDEX IF NOT EXISTS idx_appointment_messages_appointment_id 
ON public.appointment_messages(appointment_id);

-- 4. Enable RLS
ALTER TABLE public.appointment_messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Allow select for all roles" ON public.appointment_messages;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.appointment_messages;

-- SELECT POLICY (Allow select for authenticated owners, staff, and anonymous guests)
CREATE POLICY "Allow select for all roles"
ON public.appointment_messages
FOR SELECT
TO anon, authenticated
USING (true);

-- INSERT POLICY (Only authenticated patients or staff can insert directly, server actions will use service role for guest writes)
CREATE POLICY "Allow insert for authenticated users"
ON public.appointment_messages
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = (SELECT patient_id FROM public.appointments WHERE id = appointment_id) OR
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN', 'DOCTOR')
);

-- 6. Enable Realtime Replication for appointment_messages
ALTER TABLE public.appointment_messages REPLICA IDENTITY FULL;

-- Check if supabase_realtime publication exists and add table to it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_messages;
  END IF;
END
$$;
