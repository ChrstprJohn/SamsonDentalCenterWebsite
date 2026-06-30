-- ============================================================================
-- 🦷 Samson Dental - Create Notifications Table and Trigger System
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority') THEN
    CREATE TYPE public.notification_priority AS ENUM ('HIGH', 'STANDARD');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  recipient_role VARCHAR(50) NOT NULL DEFAULT 'SECRETARY',
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  type VARCHAR(100) NOT NULL,
  priority public.notification_priority NOT NULL DEFAULT 'STANDARD',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(512) NOT NULL,
  
  entity_id VARCHAR(100),
  
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast dashboard read access
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread 
ON public.notifications(recipient_role, is_read, is_archived) 
WHERE is_read = FALSE AND is_archived = FALSE;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- DROP Policies if they exist
DROP POLICY IF EXISTS "Allow select for recipient or secretary on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow update for recipient or secretary on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON public.notifications;

-- SELECT POLICY
CREATE POLICY "Allow select for recipient or secretary on notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  recipient_id = auth.uid() OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'SECRETARY'
);

-- UPDATE POLICY
CREATE POLICY "Allow update for recipient or secretary on notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  recipient_id = auth.uid() OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'SECRETARY'
)
WITH CHECK (
  recipient_id = auth.uid() OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'SECRETARY'
);

-- INSERT POLICY
CREATE POLICY "Allow insert for all authenticated users"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable Supabase Realtime for notifications safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END
$$;

-- 1. Status change notifications trigger on appointments table
CREATE OR REPLACE FUNCTION public.trigger_notify_appointment_status_changes()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_name TEXT;
  v_doctor_name TEXT;
  v_service_name TEXT;
  v_type VARCHAR(100);
  v_priority public.notification_priority := 'STANDARD';
  v_title VARCHAR(255);
  v_message TEXT;
  v_link_url VARCHAR(512);
  v_trigger_notification BOOLEAN := FALSE;
BEGIN
  -- Fetch names for message construction
  SELECT CONCAT(first_name, ' ', last_name) INTO v_patient_name
  FROM public.users WHERE id = COALESCE(NEW.patient_id, OLD.patient_id);
  
  SELECT CONCAT(first_name, ' ', last_name) INTO v_doctor_name
  FROM public.users WHERE id = COALESCE(NEW.doctor_id, OLD.doctor_id);

  SELECT name INTO v_service_name
  FROM public.services WHERE id = COALESCE(NEW.service_id, OLD.service_id);

  -- NEW_APPOINTMENT_REQUEST
  IF (TG_OP = 'INSERT' AND NEW.status = 'PENDING') OR (TG_OP = 'UPDATE' AND NEW.status = 'PENDING' AND OLD.status IS DISTINCT FROM 'PENDING') THEN
    v_trigger_notification := TRUE;
    v_type := 'NEW_APPOINTMENT_REQUEST';
    v_priority := 'HIGH';
    v_title := 'New Booking Request';
    v_message := CONCAT('Patient ', COALESCE(v_patient_name, 'Patient'), ' requested ', COALESCE(v_service_name, 'Service'), ' for ', NEW.date, '.');
    v_link_url := CONCAT('/secretary/pending?id=', NEW.id);
  END IF;

  -- NEW_RESCHEDULE_REQUEST
  IF TG_OP = 'UPDATE' AND NEW.status = 'RESCHEDULE_REQUESTED' AND OLD.status IS DISTINCT FROM 'RESCHEDULE_REQUESTED' THEN
    v_trigger_notification := TRUE;
    v_type := 'NEW_RESCHEDULE_REQUEST';
    v_priority := 'HIGH';
    v_title := 'Reschedule Request';
    v_message := CONCAT('Patient ', COALESCE(v_patient_name, 'Patient'), ' has requested a reschedule for their ', COALESCE(v_service_name, 'Service'), ' appointment.');
    v_link_url := CONCAT('/secretary/reschedule-requests?id=', NEW.id);
  END IF;

  -- PATIENT_CANCEL_ALERT
  IF TG_OP = 'UPDATE' AND NEW.status = 'CANCELLED' AND OLD.status = 'APPROVED' THEN
    v_trigger_notification := TRUE;
    v_type := 'PATIENT_CANCEL_ALERT';
    v_priority := 'HIGH';
    v_title := 'Appointment Cancelled';
    v_message := CONCAT('Patient ', COALESCE(v_patient_name, 'Patient'), ' cancelled their ', COALESCE(v_service_name, 'Service'), ' appointment scheduled for ', NEW.date, '.');
    v_link_url := CONCAT('/secretary/appointments?status=CANCELLED&id=', NEW.id);
  END IF;

  -- TREATMENT_RENDERED
  IF TG_OP = 'UPDATE' AND NEW.status = 'TREATMENT_RENDERED' AND OLD.status = 'CHECKED_IN' THEN
    v_trigger_notification := TRUE;
    v_type := 'TREATMENT_RENDERED';
    v_priority := 'HIGH';
    v_title := 'Ready for Checkout';
    v_message := CONCAT('Dr. ', COALESCE(v_doctor_name, 'Doctor'), ' finished treatment for ', COALESCE(v_patient_name, 'Patient'), '. Invoice draft is ready.');
    v_link_url := CONCAT('/secretary/check-in?openCheckout=', NEW.id);
  END IF;

  IF v_trigger_notification THEN
    INSERT INTO public.notifications (
      type,
      priority,
      title,
      message,
      link_url,
      entity_id
    ) VALUES (
      v_type,
      v_priority,
      v_title,
      v_message,
      v_link_url,
      NEW.id::text
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appointment_notifications ON public.appointments;
CREATE TRIGGER trg_appointment_notifications
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_appointment_status_changes();


-- Wait, let's keep the real trigger logic:
CREATE OR REPLACE FUNCTION public.trigger_notify_time_block_conflict()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doctor_name TEXT;
  v_conflict_count INT;
BEGIN
  SELECT COUNT(*), CONCAT(MAX(u.first_name), ' ', MAX(u.last_name))
  INTO v_conflict_count, v_doctor_name
  FROM public.appointments a
  JOIN public.users u ON u.id = a.doctor_id
  WHERE a.doctor_id = NEW.doctor_id
    AND a.date = NEW.date
    AND a.status = 'APPROVED'
    AND (
      (a.start_time::timestamp, a.end_time::timestamp) OVERLAPS 
      (NEW.date + NEW.start_time, NEW.date + NEW.end_time)
    );

  IF v_conflict_count > 0 THEN
    INSERT INTO public.notifications (
      type,
      priority,
      title,
      message,
      link_url,
      entity_id
    ) VALUES (
      'DOCTOR_VACATION_CONFLICT',
      'HIGH',
      'Doctor Schedule Conflict',
      CONCAT('Dr. ', COALESCE(v_doctor_name, 'Doctor'), ' scheduled leave on ', NEW.date, '. ', v_conflict_count, ' appointment(s) require displacement.'),
      CONCAT('/secretary/appointments?status=APPROVED&date=', NEW.date, '&doctorId=', NEW.doctor_id),
      NEW.id::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_time_block_conflict ON public.time_blocks;
CREATE TRIGGER trg_time_block_conflict
AFTER INSERT ON public.time_blocks
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_time_block_conflict();


-- 3. Outbox fail notifications trigger on outbox table
CREATE OR REPLACE FUNCTION public.trigger_notify_outbox_failed()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipient_email TEXT;
BEGIN
  IF NEW.status = 'FAILED'::public.outbox_status AND OLD.status IS DISTINCT FROM 'FAILED'::public.outbox_status THEN
    v_recipient_email := NEW.payload ->> 'recipientEmail';
    IF v_recipient_email IS NULL THEN
      v_recipient_email := NEW.payload ->> 'email';
    END IF;
    
    INSERT INTO public.notifications (
      type,
      priority,
      title,
      message,
      link_url,
      entity_id
    ) VALUES (
      'FAILED_EMAIL_ALERT',
      'HIGH',
      'Email Delivery Failed',
      CONCAT('Failed sending email to ', COALESCE(v_recipient_email, 'recipient'), '.'),
      CONCAT('/secretary/emails?status=Failed&id=', NEW.id),
      NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_outbox_failed ON public.outbox;
CREATE TRIGGER trg_outbox_failed
AFTER UPDATE ON public.outbox
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_outbox_failed();


-- 4. New inquiry trigger on appointment_inquiries table
CREATE OR REPLACE FUNCTION public.trigger_notify_new_inquiry()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service_name TEXT;
BEGIN
  SELECT name INTO v_service_name
  FROM public.services
  WHERE id = NEW.preferred_service_id;

  INSERT INTO public.notifications (
    type,
    priority,
    title,
    message,
    link_url,
    entity_id
  ) VALUES (
    'NEW_INQUIRY',
    'STANDARD',
    'New Inquiry Queue',
    CONCAT('New inquiry from ', NEW.first_name, ' ', NEW.last_name, ' regarding ', COALESCE(v_service_name, 'Dental Service'), '.'),
    CONCAT('/secretary/inquiries?id=', NEW.id),
    NEW.id::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appointment_inquiries_inserted ON public.appointment_inquiries;
CREATE TRIGGER trg_appointment_inquiries_inserted
AFTER INSERT ON public.appointment_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_new_inquiry();
