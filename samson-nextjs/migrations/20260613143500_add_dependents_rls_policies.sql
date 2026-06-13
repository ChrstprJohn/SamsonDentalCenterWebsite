-- ============================================================================
-- 🦷 Samson Dental - Enable RLS & Add Policies for Dependents Table
-- ============================================================================

-- Enable RLS on dependents table
ALTER TABLE public.dependents ENABLE ROW LEVEL SECURITY;

-- 1. Patients can select their own dependents, and Staff/Admins/Doctors can select all
CREATE POLICY "Allow select for owners and staff"
ON public.dependents
FOR SELECT
TO authenticated
USING (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
);

-- 2. Patients can insert their own dependents, and Secretary/Admin can insert
CREATE POLICY "Allow insert for owners and staff"
ON public.dependents
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);

-- 3. Patients can update their own dependents, and Secretary/Admin can update
CREATE POLICY "Allow update for owners and staff"
ON public.dependents
FOR UPDATE
TO authenticated
USING (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
)
WITH CHECK (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);

-- 4. Patients can delete their own dependents, and Secretary/Admin can delete
CREATE POLICY "Allow delete for owners and staff"
ON public.dependents
FOR DELETE
TO authenticated
USING (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);
