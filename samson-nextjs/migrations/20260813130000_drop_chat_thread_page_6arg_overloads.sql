-- Fix ambiguous chat thread RPC overloads.
-- 20260813120000 added p_appointment_id to get_secretary_chat_threads_page(_staff),
-- but CREATE OR REPLACE with a new parameter count leaves the old 6-arg overloads
-- behind, so named-arg RPC calls match both and Postgres cannot pick one.
-- Drop the obsolete 6-arg versions (wrapper first; it references the inner one).

DROP FUNCTION IF EXISTS public.get_secretary_chat_threads_page_staff(INT, TIMESTAMPTZ, UUID, TEXT, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.get_secretary_chat_threads_page(INT, TIMESTAMPTZ, UUID, TEXT, TEXT, BOOLEAN);
