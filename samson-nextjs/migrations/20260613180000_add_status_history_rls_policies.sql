-- ============================================================================
-- 🦷 Samson Dental - Enable RLS & Add SELECT/INSERT Policies for Status History Ledger
-- ============================================================================

-- Enable RLS on appointment_status_history table
ALTER TABLE public.appointment_status_history ENABLE ROW LEVEL SECURITY;

-- 1. SELECT POLICY (Allow patients to view history of their own appointments, and staff to view all)
CREATE POLICY "Allow select for owners and staff on status history"
ON public.appointment_status_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_status_history.appointment_id
      AND (
        a.patient_id = auth.uid() OR
        ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
      )
  )
);

-- 2. INSERT POLICY (Allow patients to insert history entries for their own appointments, and staff for all)
CREATE POLICY "Allow insert for owners and staff on status history"
ON public.appointment_status_history
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_status_history.appointment_id
      AND (
        a.patient_id = auth.uid() OR
        ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
      )
  )
);
