-- Migration: Create coordination_logs table for secretary outreach hub
-- Date: 2026-07-16
-- Purpose: Temporary scratchpad log for secretary actions during inquiry review.
--          Entries are scoped to an inquiry and deleted when inquiry is resolved.

CREATE TABLE IF NOT EXISTS public.coordination_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id UUID NOT NULL REFERENCES public.appointment_inquiries(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'SCHEDULE_CONFLICT',
        'NEEDS_RESCHEDULE',
        'WAITING_ON_DOCTOR',
        'CALLED_NO_ANSWER',
        'LEFT_VOICEMAIL',
        'SMS_SENT',
        'EMAIL_SENT',
        'CUSTOM_NOTE'
    )),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_coordination_logs_inquiry_id
ON public.coordination_logs(inquiry_id);

CREATE INDEX IF NOT EXISTS idx_coordination_logs_created_at
ON public.coordination_logs(inquiry_id, created_at DESC);

ALTER TABLE public.coordination_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select coordination_logs for staff" ON public.coordination_logs;
CREATE POLICY "Allow select coordination_logs for staff"
ON public.coordination_logs
FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN', 'DOCTOR')
);

DROP POLICY IF EXISTS "Allow insert coordination_logs for staff" ON public.coordination_logs;
CREATE POLICY "Allow insert coordination_logs for staff"
ON public.coordination_logs
FOR INSERT
TO authenticated
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
);

DROP POLICY IF EXISTS "Allow delete coordination_logs for staff" ON public.coordination_logs;
CREATE POLICY "Allow delete coordination_logs for staff"
ON public.coordination_logs
FOR DELETE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN')
);
