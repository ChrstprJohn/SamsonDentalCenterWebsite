-- Migration: Add calendar_notes table for secretary filler/tentative notes
-- Date: 2026-08-15
-- Purpose: Free-text scratchpad notes on the secretary calendar. NOT real
--          appointments: no overlap constraints, no notifications, no status
--          ledger, no outbox. Convertible to a real appointment later.

CREATE TABLE IF NOT EXISTS public.calendar_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    start_time TIME,
    note TEXT NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_notes_date
ON public.calendar_notes(date, start_time);

ALTER TABLE public.calendar_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select calendar_notes for staff" ON public.calendar_notes;
CREATE POLICY "Allow select calendar_notes for staff"
ON public.calendar_notes
FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN', 'DOCTOR')
);

DROP POLICY IF EXISTS "Allow insert calendar_notes for staff" ON public.calendar_notes;
CREATE POLICY "Allow insert calendar_notes for staff"
ON public.calendar_notes
FOR INSERT
TO authenticated
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
);

DROP POLICY IF EXISTS "Allow delete calendar_notes for staff" ON public.calendar_notes;
CREATE POLICY "Allow delete calendar_notes for staff"
ON public.calendar_notes
FOR DELETE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
);