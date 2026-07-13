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

-- 7. Trigger: Send automated welcome message on appointment approval
CREATE OR REPLACE FUNCTION public.trigger_on_appointment_approved()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'APPROVED') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'APPROVED' AND (OLD.status IS NULL OR OLD.status != 'APPROVED')) THEN
    INSERT INTO public.appointment_messages (
      appointment_id,
      sender_role,
      sender_name,
      message
    ) VALUES (
      NEW.id,
      'STAFF',
      'System',
      'Hello! Your appointment is approved. If you need to reschedule or cancel, please reply here.'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_appointment_approved_message
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_on_appointment_approved();

-- 8. Trigger: Send auto-response on patient first chat message
CREATE OR REPLACE FUNCTION public.trigger_on_new_patient_message()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_msg_count INT;
BEGIN
  IF NEW.sender_role = 'PATIENT' THEN
    SELECT COUNT(*) INTO v_patient_msg_count
    FROM public.appointment_messages
    WHERE appointment_id = NEW.appointment_id
      AND sender_role = 'PATIENT'
      AND id != NEW.id;

    IF v_patient_msg_count = 0 THEN
      INSERT INTO public.appointment_messages (
        appointment_id,
        sender_role,
        sender_name,
        message
      ) VALUES (
        NEW.appointment_id,
        'STAFF',
        'System',
        'This is an automated message. We have received your message and our team will get back to you shortly.'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_new_patient_message
AFTER INSERT ON public.appointment_messages
FOR EACH ROW
EXECUTE FUNCTION public.trigger_on_new_patient_message();

