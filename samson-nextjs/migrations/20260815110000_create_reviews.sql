-- Migration: Create reviews table
-- Date: 2026-08-15
-- Purpose: Patient star-rating + optional comment captured from the post-care
--          review link emailed after checkout. One review per appointment;
--          re-visiting the link updates the existing review.

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at
ON public.reviews(created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select reviews for staff" ON public.reviews;
CREATE POLICY "Allow select reviews for staff"
ON public.reviews
FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
);

DROP POLICY IF EXISTS "Allow delete reviews for staff" ON public.reviews;
CREATE POLICY "Allow delete reviews for staff"
ON public.reviews
FOR DELETE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
);