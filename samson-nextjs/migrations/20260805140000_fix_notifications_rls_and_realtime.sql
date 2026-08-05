-- ============================================================================
-- Fix: Notifications RLS — use current_user_role() instead of JWT user_metadata
-- ============================================================================
-- Root cause of missing realtime push notifications:
--
-- The original policy checked:
--   ((auth.jwt() -> 'user_metadata') ->> 'role') = 'SECRETARY'
--
-- This is unreliable because:
--   1. Supabase Realtime evaluates RLS SELECT policy on each INSERT event to
--      decide whether to deliver the payload to the subscriber.
--   2. If the role is stored in the `users` table (not in user_metadata JWT),
--      or if the JWT hasn't been refreshed since signup, the condition evaluates
--      to NULL/FALSE → realtime event is silently dropped.
--
-- The rest of the codebase (migration 20260802210000) standardized on
-- public.current_user_role() which reads from the users table via auth.uid().
-- This migration brings notifications in line with that standard.
-- ============================================================================

BEGIN;

-- REPLICA IDENTITY FULL is required for Supabase Realtime postgres_changes to
-- deliver events on tables with RLS enabled. Without it, the realtime server
-- cannot reconstruct the full row from WAL to evaluate RLS policies, so events
-- are silently dropped. DEFAULT (the PostgreSQL default) only tracks the primary
-- key, which is insufficient.
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- ── SELECT ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow select for recipient or secretary on notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;

CREATE POLICY "notifications_select"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  recipient_id = auth.uid()
  OR public.current_user_role() IN (
    'SECRETARY'::public.user_role,
    'ADMIN'::public.user_role
  )
);

-- ── UPDATE ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow update for recipient or secretary on notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;

CREATE POLICY "notifications_update"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  recipient_id = auth.uid()
  OR public.current_user_role() IN (
    'SECRETARY'::public.user_role,
    'ADMIN'::public.user_role
  )
)
WITH CHECK (
  recipient_id = auth.uid()
  OR public.current_user_role() IN (
    'SECRETARY'::public.user_role,
    'ADMIN'::public.user_role
  )
);

-- ── INSERT ──────────────────────────────────────────────────────────────────
-- Keep open for authenticated users (server actions call with anon key + session).
-- service_role (used by DB triggers SECURITY DEFINER) bypasses RLS automatically.
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;

CREATE POLICY "notifications_insert_authenticated"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

COMMIT;
