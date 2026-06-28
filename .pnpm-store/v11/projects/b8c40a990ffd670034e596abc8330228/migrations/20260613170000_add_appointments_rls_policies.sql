-- Enable RLS on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 1. SELECT POLICY (Allow patients to view their own appointments, and staff to view all)
CREATE POLICY "Allow select for owners and staff on appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
);

-- 2. INSERT POLICY (Allow patients to create their own bookings, and staff to create bookings)
CREATE POLICY "Allow insert for owners and staff on appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);

-- 3. UPDATE POLICY (Allow patients to update/cancel/reschedule their own appointments, and staff to manage them)
CREATE POLICY "Allow update for owners and staff on appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
)
WITH CHECK (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
);
