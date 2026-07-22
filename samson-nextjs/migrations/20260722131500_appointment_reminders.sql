-- Migration: Add 24h & 48h appointment reminder system support
-- Date: 2026-07-22

-- 1. Add state tracking columns to appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_48h_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Trigger function to initialize reminder state based on booking lead time
CREATE OR REPLACE FUNCTION public.initialize_appointment_reminders()
RETURNS TRIGGER AS $$
DECLARE
  v_duration INTERVAL;
BEGIN
  IF NEW.start_time IS NOT NULL THEN
    -- Calculate interval between current time and appointment start time
    v_duration := NEW.start_time - CURRENT_TIMESTAMP;

    -- Only recalculate on new row or when start_time/date changes
    IF TG_OP = 'INSERT' 
       OR OLD.start_time IS NULL 
       OR NEW.start_time IS DISTINCT FROM OLD.start_time 
       OR NEW.date IS DISTINCT FROM OLD.date THEN
      
      IF v_duration < INTERVAL '24 hours' THEN
        -- Booked < 24h away: skip both reminders
        NEW.reminder_24h_sent := TRUE;
        NEW.reminder_48h_sent := TRUE;
      ELSIF v_duration >= INTERVAL '24 hours' AND v_duration <= INTERVAL '48 hours' THEN
        -- Booked between 24h and 48h away: skip 48h reminder, send 24h when time comes
        NEW.reminder_24h_sent := FALSE;
        NEW.reminder_48h_sent := TRUE;
      ELSE
        -- Booked > 48h away: enable both reminders
        NEW.reminder_24h_sent := FALSE;
        NEW.reminder_48h_sent := FALSE;
      END IF;
    END IF;
  ELSE
    -- If no start_time set yet (pending approval/request), reset flags
    NEW.reminder_24h_sent := FALSE;
    NEW.reminder_48h_sent := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_initialize_appointment_reminders ON public.appointments;
CREATE TRIGGER trg_initialize_appointment_reminders
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.initialize_appointment_reminders();

-- 3. Scanner function to select upcoming appointments and enqueue outbox reminder events
CREATE OR REPLACE FUNCTION public.scan_and_queue_appointment_reminders()
RETURNS VOID AS $$
DECLARE
  v_app RECORD;
BEGIN
  -- 3A. Scan for 48-Hour Reminders
  FOR v_app IN 
    SELECT 
      a.id, 
      COALESCE(u.email, gc.email) AS recipient_email
    FROM public.appointments a
    LEFT JOIN public.users u ON a.patient_id = u.id
    LEFT JOIN public.guest_contacts gc ON a.id = gc.appointment_id
    WHERE a.status = 'APPROVED'
      AND a.start_time IS NOT NULL
      AND a.start_time <= CURRENT_TIMESTAMP + INTERVAL '48 hours'
      AND a.start_time > CURRENT_TIMESTAMP
      AND a.reminder_48h_sent = FALSE
  LOOP
    IF v_app.recipient_email IS NOT NULL AND v_app.recipient_email != '' THEN
      INSERT INTO public.outbox (event_type, payload)
      VALUES (
        'APPOINTMENT_REMINDER_48H',
        jsonb_build_object(
          'appointmentId', v_app.id,
          'email', v_app.recipient_email
        )
      );
    END IF;
    
    UPDATE public.appointments 
    SET reminder_48h_sent = TRUE 
    WHERE id = v_app.id;
  END LOOP;

  -- 3B. Scan for 24-Hour Reminders
  FOR v_app IN 
    SELECT 
      a.id, 
      COALESCE(u.email, gc.email) AS recipient_email
    FROM public.appointments a
    LEFT JOIN public.users u ON a.patient_id = u.id
    LEFT JOIN public.guest_contacts gc ON a.id = gc.appointment_id
    WHERE a.status = 'APPROVED'
      AND a.start_time IS NOT NULL
      AND a.start_time <= CURRENT_TIMESTAMP + INTERVAL '24 hours'
      AND a.start_time > CURRENT_TIMESTAMP
      AND a.reminder_24h_sent = FALSE
  LOOP
    IF v_app.recipient_email IS NOT NULL AND v_app.recipient_email != '' THEN
      INSERT INTO public.outbox (event_type, payload)
      VALUES (
        'APPOINTMENT_REMINDER_24H',
        jsonb_build_object(
          'appointmentId', v_app.id,
          'email', v_app.recipient_email
        )
      );
    END IF;
    
    UPDATE public.appointments 
    SET reminder_24h_sent = TRUE 
    WHERE id = v_app.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Enable pg_cron schedule if pg_cron extension exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'hourly-appointment-reminder-scan',
      '0 * * * *',
      'SELECT public.scan_and_queue_appointment_reminders();'
    );
  END IF;
END $$;
