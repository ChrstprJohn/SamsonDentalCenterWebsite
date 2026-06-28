-- ============================================================================
-- 🦷 Samson Dental - Enable RLS & Add SELECT/INSERT/UPDATE Policies for Invoices
-- ============================================================================

-- Enable RLS on invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 1. SELECT POLICY (Allow patients to view invoices for their own appointments, and staff to view all)
CREATE POLICY "Allow select for owners and staff on invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = invoices.appointment_id
      AND (
        a.patient_id = auth.uid() OR
        ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
      )
  )
);

-- 2. INSERT POLICY (Allow staff to generate/insert invoices)
CREATE POLICY "Allow insert for staff on invoices"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
);

-- 3. UPDATE POLICY (Allow staff to update/finalize invoices)
CREATE POLICY "Allow update for staff on invoices"
ON public.invoices
FOR UPDATE
TO authenticated
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
)
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);
