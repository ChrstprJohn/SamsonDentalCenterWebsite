-- Migration: Make communication_activity_summaries channel-aware for failures
-- Only count failures for channels currently enabled on the appointment (EMAIL, SMS, or BOTH).

BEGIN;

CREATE OR REPLACE FUNCTION public.refresh_communication_activity_summary(p_appointment_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_appointment_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.communication_activity_summaries (
    appointment_id, last_activity, has_failed, failure_count, has_email,
    has_sms, latest_event_type, latest_recipient, updated_at
  )
  SELECT
    o.appointment_id,
    MAX(o.created_at),
    COALESCE(BOOL_OR(
      o.status = 'FAILED'::public.outbox_status AND (
        a.confirmation_channel = 'BOTH' OR
        a.confirmation_channel IS NULL OR
        (a.confirmation_channel = 'EMAIL' AND o.event_type NOT LIKE '%_SMS') OR
        (a.confirmation_channel = 'SMS' AND o.event_type LIKE '%_SMS')
      )
    ), FALSE),
    COALESCE(COUNT(*) FILTER (
      WHERE o.status = 'FAILED'::public.outbox_status AND (
        a.confirmation_channel = 'BOTH' OR
        a.confirmation_channel IS NULL OR
        (a.confirmation_channel = 'EMAIL' AND o.event_type NOT LIKE '%_SMS') OR
        (a.confirmation_channel = 'SMS' AND o.event_type LIKE '%_SMS')
      )
    ), 0),
    COALESCE(BOOL_OR(o.event_type NOT LIKE '%_SMS' AND COALESCE(o.payload->>'email', o.payload->>'guestEmail') IS NOT NULL), FALSE),
    COALESCE(BOOL_OR(o.event_type LIKE '%_SMS' OR COALESCE(o.payload->>'phoneNumber', o.payload->>'phone', o.payload->>'mobileNumber') IS NOT NULL), FALSE),
    (ARRAY_AGG(o.event_type ORDER BY o.created_at DESC, o.id DESC))[1],
    (ARRAY_AGG(COALESCE(o.payload->>'email', o.payload->>'guestEmail', o.payload->>'phoneNumber', o.payload->>'phone', o.payload->>'mobileNumber', '') ORDER BY o.created_at DESC, o.id DESC))[1],
    NOW()
  FROM public.outbox AS o
  INNER JOIN public.appointments AS a ON a.id = o.appointment_id
  WHERE o.appointment_id = p_appointment_id
  GROUP BY o.appointment_id
  ON CONFLICT (appointment_id) DO UPDATE SET
    last_activity = EXCLUDED.last_activity,
    has_failed = EXCLUDED.has_failed,
    failure_count = EXCLUDED.failure_count,
    has_email = EXCLUDED.has_email,
    has_sms = EXCLUDED.has_sms,
    latest_event_type = EXCLUDED.latest_event_type,
    latest_recipient = EXCLUDED.latest_recipient,
    updated_at = NOW();

  IF NOT FOUND THEN
    DELETE FROM public.communication_activity_summaries
    WHERE appointment_id = p_appointment_id;
  END IF;
END;
$$;

-- Trigger to refresh communication summary whenever appointment confirmation channel changes
CREATE OR REPLACE FUNCTION public.trg_refresh_comm_summary_on_channel_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_communication_activity_summary(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_comm_summary_on_channel_change ON public.appointments;
CREATE TRIGGER trg_refresh_comm_summary_on_channel_change
AFTER UPDATE OF confirmation_channel ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trg_refresh_comm_summary_on_channel_change();

-- Backfill / refresh existing summaries with channel-aware logic
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT appointment_id FROM public.communication_activity_summaries LOOP
    PERFORM public.refresh_communication_activity_summary(r.appointment_id);
  END LOOP;
END;
$$;

COMMIT;
