-- Reviews must be explicitly approved before appearing on the public website.
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_featured_on_landing BOOLEAN NOT NULL DEFAULT FALSE;

DROP POLICY IF EXISTS "Allow update reviews for staff" ON public.reviews;
CREATE POLICY "Allow update reviews for staff"
ON public.reviews
FOR UPDATE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
)
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
);
