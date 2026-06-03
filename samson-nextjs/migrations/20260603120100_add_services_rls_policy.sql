-- ============================================================================
-- 🦷 Samson Dental - Enable RLS & Add Public Select Policy for Services
-- ============================================================================

-- Enable RLS on services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read/select access to all users (both authenticated and anonymous)
-- since the services catalog is a public marketing resource.
CREATE POLICY "Allow public read access to services"
ON public.services
FOR SELECT
USING (true);

-- Create policy to allow write access (insert/update/delete) for ADMIN users
CREATE POLICY "Allow write access to admin users"
ON public.services
FOR ALL
TO authenticated
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'ADMIN'
)
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'ADMIN'
);
