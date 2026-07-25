-- Migration: Add scan_and_mark_expired_no_shows RPC function
-- Purpose: Auto-mark past APPROVED appointments as NO_SHOW via cron job.

CREATE OR REPLACE FUNCTION public.scan_and_mark_expired_no_shows()
RETURNS INT AS $$
DECLARE
  v_updated_count INT := 0;
  v_app RECORD;
BEGIN
  FOR v_app IN
    SELECT id, date, end_time
    FROM public.appointments
    WHERE status = 'APPROVED'
      AND end_time IS NOT NULL
      AND (
        date < CURRENT_DATE
        OR (date = CURRENT_DATE AND end_time <= CURRENT_TIMESTAMP)
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
