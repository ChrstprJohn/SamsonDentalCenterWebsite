-- Migration: Auto-link inquiry outbox logs to converted appointments
-- Date: 2026-08-04

-- 1. Backfill past converted inquiry outbox logs
UPDATE public.outbox o
SET appointment_id = ai.linked_appointment_id
FROM public.appointment_inquiries ai
WHERE o.appointment_id IS NULL
  AND ai.linked_appointment_id IS NOT NULL
  AND (o.payload->>'inquiryId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND (o.payload->>'inquiryId')::uuid = ai.id;

-- 2. Create trigger function to link inquiry outbox rows on conversion
CREATE OR REPLACE FUNCTION public.sync_inquiry_outbox_appointment_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.linked_appointment_id IS NOT NULL AND (OLD.linked_appointment_id IS NULL OR OLD.linked_appointment_id IS DISTINCT FROM NEW.linked_appointment_id) THEN
    UPDATE public.outbox
    SET appointment_id = NEW.linked_appointment_id
    WHERE (payload->>'inquiryId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND (payload->>'inquiryId')::uuid = NEW.id
      AND (appointment_id IS NULL OR appointment_id IS DISTINCT FROM NEW.linked_appointment_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_inquiry_outbox_appointment_id ON public.appointment_inquiries;
CREATE TRIGGER trg_sync_inquiry_outbox_appointment_id
AFTER INSERT OR UPDATE OF linked_appointment_id ON public.appointment_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.sync_inquiry_outbox_appointment_id();

COMMENT ON FUNCTION public.sync_inquiry_outbox_appointment_id IS
  'Automatically links initial inquiry outbox emails (APPOINTMENT_INQUIRY_RECEIVED) to converted appointments so they appear in appointment communication details.';
