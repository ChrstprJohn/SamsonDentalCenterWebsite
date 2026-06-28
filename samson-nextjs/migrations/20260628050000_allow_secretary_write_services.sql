-- Migration: Allow SECRETARY and ADMIN roles write access to services and add image_url column

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;

DROP POLICY IF EXISTS "Allow write access to admin users" ON public.services;
DROP POLICY IF EXISTS "Allow write access to admin and secretary users" ON public.services;

CREATE POLICY "Allow write access to admin and secretary users"
ON public.services
FOR ALL
TO authenticated
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('ADMIN', 'SECRETARY')
)
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('ADMIN', 'SECRETARY')
);

-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('services-images', 'services-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for services-images bucket
DROP POLICY IF EXISTS "Public Read Access to service images" ON storage.objects;
CREATE POLICY "Public Read Access to service images"
ON storage.objects FOR SELECT
USING (bucket_id = 'services-images');

DROP POLICY IF EXISTS "Authenticated Upload Access to service images" ON storage.objects;
CREATE POLICY "Authenticated Upload Access to service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'services-images');

DROP POLICY IF EXISTS "Authenticated Update Access to service images" ON storage.objects;
CREATE POLICY "Authenticated Update Access to service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'services-images');

DROP POLICY IF EXISTS "Authenticated Delete Access to service images" ON storage.objects;
CREATE POLICY "Authenticated Delete Access to service images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'services-images');

