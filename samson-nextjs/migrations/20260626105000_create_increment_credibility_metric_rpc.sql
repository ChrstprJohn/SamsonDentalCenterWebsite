-- Migration: Create increment_credibility_metric RPC
-- Date: 2026-06-26
-- Description: Creates the public.increment_credibility_metric RPC function to increment credibility counters on the users table.

CREATE OR REPLACE FUNCTION public.increment_credibility_metric(
    p_user_id UUID,
    p_metric TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_metric = 'cancel_count' THEN
        UPDATE public.users
        SET cancel_count = COALESCE(cancel_count, 0) + 1
        WHERE id = p_user_id;
    ELSIF p_metric = 'no_show_count' THEN
        UPDATE public.users
        SET no_show_count = COALESCE(no_show_count, 0) + 1
        WHERE id = p_user_id;
    ELSIF p_metric = 'reschedule_count' THEN
        UPDATE public.users
        SET reschedule_count = COALESCE(reschedule_count, 0) + 1
        WHERE id = p_user_id;
    ELSE
        RAISE EXCEPTION 'Invalid metric: %', p_metric;
    END IF;
END;
$$;
