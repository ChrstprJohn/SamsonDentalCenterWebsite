-- Migration: Add scan_and_mark_expired_no_shows RPC function
-- Purpose: Auto-mark past APPROVED appointments as NO_SHOW via cron job.
--
-- TIMEZONE & TIME HANDLING DESIGN NOTE:
-- 1. All clinic operating hours and booking slots are fixed to Philippine Time (Asia/Manila / UTC+8).
-- 2. Appointment end_time timestamps are saved representing local clinic time (e.g. 10:11 AM stored with +00 Z suffix).
-- 3. Supabase DB server clock evaluates CURRENT_TIMESTAMP in UTC (which is 8 hours behind Manila local time).
-- 4. To ensure auto-no-show correctly triggers when the appointment slot ends in Manila local time,
--    we compare end_time against both CURRENT_TIMESTAMP and v_now_manila (timezone('Asia/Manila', now())).

CREATE OR REPLACE FUNCTION public.scan_and_mark_expired_no_shows()
RETURNS INT AS $$
DECLARE
  v_updated_count INT := 0;
  v_app RECORD;
  v_now_manila TIMESTAMPTZ := timezone('Asia/Manila', now());
BEGIN
  FOR v_app IN
    SELECT id, date, end_time
    FROM public.appointments
    WHERE status = 'APPROVED'
      AND end_time IS NOT NULL
      AND (
        date::date < CURRENT_DATE
        OR (
          date::date = CURRENT_DATE 
          AND (
            end_time <= CURRENT_TIMESTAMP 
            OR end_time <= v_now_manila
          )
        )
      )
  LOOP
    UPDATE public.appointments
    SET 
      status = 'NO_SHOW',
      status_reason = 'Auto-marked as no-show (slot time passed without check-in)',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = v_app.id;

    -- Record status history audit log
    INSERT INTO public.appointment_status_history (
      appointment_id,
      actor_role,
      previous_status,
      new_status,
      reason,
      created_at
    ) VALUES (
      v_app.id,
      'SYSTEM',
      'APPROVED',
      'NO_SHOW',
      'Auto-marked as no-show (slot time passed without check-in)',
      CURRENT_TIMESTAMP
    );

    v_updated_count := v_updated_count + 1;
  END LOOP;

  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


