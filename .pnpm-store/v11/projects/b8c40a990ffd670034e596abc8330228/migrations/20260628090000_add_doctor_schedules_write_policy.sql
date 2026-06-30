-- Migration: Allow SECRETARY and ADMIN roles write access to doctor_schedules table

DROP POLICY IF EXISTS "Allow staff write access to doctor_schedules" ON public.doctor_schedules;

CREATE POLICY "Allow staff write access to doctor_schedules"
ON public.doctor_schedules
FOR ALL
TO authenticated
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('ADMIN', 'SECRETARY')
)
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('ADMIN', 'SECRETARY')
);
