-- Keeps a confirmed no-show visible in history while removing it from the
-- operational follow-up queue. New no-shows are always unresolved.
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS no_show_resolved_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS no_show_resolution TEXT NULL
    CHECK (no_show_resolution IN ('COMPLETED', 'CONFIRMED_NO_SHOW', 'RESCHEDULE'));

CREATE OR REPLACE FUNCTION public.reset_no_show_resolution_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'NO_SHOW'::public.appointment_status
     AND OLD.status IS DISTINCT FROM 'NO_SHOW'::public.appointment_status THEN
    NEW.no_show_resolved_at := NULL;
    NEW.no_show_resolution := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reset_no_show_resolution_on_status_change ON public.appointments;
CREATE TRIGGER trg_reset_no_show_resolution_on_status_change
BEFORE UPDATE OF status ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.reset_no_show_resolution_on_status_change();
