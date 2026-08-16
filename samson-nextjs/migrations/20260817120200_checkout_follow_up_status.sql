-- Migration: Response status flags + manual entry source
-- Date: 2026-08-17
-- Purpose: secretary triage on wellbeing responses: status (UNRESOLVED /
--          NO_ACTION_NEEDED / WITH_DOCTOR / COMPLETED) and manual entry
--          channel (PHONE / EMAIL). Existing rows default to FORM + UNRESOLVED.

ALTER TABLE public.checkout_follow_up_responses
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'UNRESOLVED',
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'FORM',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;