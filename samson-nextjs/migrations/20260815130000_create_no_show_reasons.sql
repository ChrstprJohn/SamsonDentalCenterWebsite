-- Migration: Create no_show_reasons table
-- Date: 2026-08-15
-- Purpose: Patient-submitted missed-appointment reason captured from the
--          no-show-reason link in the missed-appointment email/SMS. One
--          reason per appointment; re-visiting the link updates it.

CREATE TABLE IF NOT EXISTS public.no_show_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_no_show_reasons_created_at
ON public.no_show_reasons(created_at DESC);

ALTER TABLE public.no_show_reasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select no show reasons for staff" ON public.no_show_reasons;
CREATE POLICY "Allow select no show reasons for staff"
ON public.no_show_reasons
FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
);

DROP POLICY IF EXISTS "Allow delete no show reasons for staff" ON public.no_show_reasons;
CREATE POLICY "Allow delete no show reasons for staff"
ON public.no_show_reasons
FOR DELETE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
);