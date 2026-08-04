-- Secretary V2 security and query-shape improvements.
--
-- This migration intentionally does not add caching. It makes reads smaller and
-- keeps authorization/data freshness at the database boundary.

BEGIN;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.role
  FROM public.users AS u
  WHERE u.id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.require_staff_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.current_user_role() NOT IN (
    'SECRETARY'::public.user_role,
    'ADMIN'::public.user_role
  ) THEN
    RAISE EXCEPTION 'Staff authorization required';
  END IF;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.require_staff_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.require_staff_access() TO authenticated, service_role;

-- Users are server-owned identity data. Patients may read their own row and
-- staff may read staff data; public doctor/service directories use server
-- actions with explicit projections instead of direct table access.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "secretary_v2_users_select" ON public.users;
CREATE POLICY "secretary_v2_users_select"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  public.current_user_role() IN (
    'SECRETARY'::public.user_role,
    'ADMIN'::public.user_role,
    'DOCTOR'::public.user_role
  )
);

REVOKE ALL ON TABLE public.users FROM anon;

-- Replace mutable JWT metadata checks on the appointment/inquiry boundaries.
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for owners and staff on appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow insert for owners and staff on appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow update for owners and staff on appointments" ON public.appointments;
DROP POLICY IF EXISTS "secretary_v2_appointments_select" ON public.appointments;
DROP POLICY IF EXISTS "secretary_v2_appointments_insert" ON public.appointments;
DROP POLICY IF EXISTS "secretary_v2_appointments_update" ON public.appointments;

CREATE POLICY "secretary_v2_appointments_select"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  auth.uid() = patient_id OR
  public.current_user_role() IN ('DOCTOR'::public.user_role, 'SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
);

CREATE POLICY "secretary_v2_appointments_insert"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = patient_id OR
  public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
);

CREATE POLICY "secretary_v2_appointments_update"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  auth.uid() = patient_id OR
  public.current_user_role() IN ('DOCTOR'::public.user_role, 'SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
)
WITH CHECK (
  auth.uid() = patient_id OR
  public.current_user_role() IN ('DOCTOR'::public.user_role, 'SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
);

ALTER TABLE public.appointment_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select/write access to staff users" ON public.appointment_inquiries;
DROP POLICY IF EXISTS "Allow select/write access to staff users for inquiries" ON public.appointment_inquiries;
DROP POLICY IF EXISTS "secretary_v2_inquiries_staff" ON public.appointment_inquiries;
CREATE POLICY "secretary_v2_inquiries_staff"
ON public.appointment_inquiries
FOR ALL
TO authenticated
USING (public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role))
WITH CHECK (public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role));

-- Chat messages are never public. Guest chat uses a server-only token path;
-- authenticated reads/writes are limited to the patient or staff roles.
ALTER TABLE public.appointment_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for all roles" ON public.appointment_messages;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.appointment_messages;
DROP POLICY IF EXISTS "secretary_v2_chat_select" ON public.appointment_messages;
DROP POLICY IF EXISTS "secretary_v2_chat_insert" ON public.appointment_messages;
DROP POLICY IF EXISTS "secretary_v2_chat_update" ON public.appointment_messages;

CREATE POLICY "secretary_v2_chat_select"
ON public.appointment_messages
FOR SELECT
TO authenticated
USING (
  public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role, 'DOCTOR'::public.user_role)
  OR EXISTS (
    SELECT 1
    FROM public.appointments AS a
    WHERE a.id = appointment_messages.appointment_id
      AND a.patient_id = auth.uid()
  )
);

CREATE POLICY "secretary_v2_chat_insert"
ON public.appointment_messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role, 'DOCTOR'::public.user_role)
  OR (
    auth.uid() = (SELECT a.patient_id FROM public.appointments AS a WHERE a.id = appointment_messages.appointment_id)
    AND appointment_messages.sender_role = 'PATIENT'
  )
);

CREATE POLICY "secretary_v2_chat_update"
ON public.appointment_messages
FOR UPDATE
TO authenticated
USING (
  public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role, 'DOCTOR'::public.user_role)
  OR EXISTS (
    SELECT 1
    FROM public.appointments AS a
    WHERE a.id = appointment_messages.appointment_id
      AND a.patient_id = auth.uid()
  )
)
WITH CHECK (
  public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role, 'DOCTOR'::public.user_role)
);

-- Notifications are visible to the recipient or staff, never to anonymous
-- clients. Inserts are server/worker work or staff actions.
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for recipient or secretary on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow update for recipient or secretary on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON public.notifications;
DROP POLICY IF EXISTS "secretary_v2_notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "secretary_v2_notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "secretary_v2_notifications_insert" ON public.notifications;

CREATE POLICY "secretary_v2_notifications_select"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  recipient_id = auth.uid() OR
  public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
);

CREATE POLICY "secretary_v2_notifications_update"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  recipient_id = auth.uid() OR
  public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
)
WITH CHECK (
  recipient_id = auth.uid() OR
  public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
);

CREATE POLICY "secretary_v2_notifications_insert"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role));

-- Keep the related detail tables on the same server-owned role boundary. The
-- legacy policies used mutable JWT metadata and could disagree with the
-- appointment/inquiry policies above.
ALTER TABLE public.dependents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for owners and staff" ON public.dependents;
DROP POLICY IF EXISTS "Allow insert for owners and staff" ON public.dependents;
DROP POLICY IF EXISTS "Allow update for owners and staff" ON public.dependents;
DROP POLICY IF EXISTS "Allow delete for owners and staff" ON public.dependents;
CREATE POLICY "secretary_v2_dependents_select"
ON public.dependents FOR SELECT TO authenticated
USING (
  auth.uid() = patient_id OR
  public.current_user_role() IN ('DOCTOR'::public.user_role, 'SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
);
CREATE POLICY "secretary_v2_dependents_write"
ON public.dependents FOR ALL TO authenticated
USING (public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role))
WITH CHECK (public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role));

ALTER TABLE public.guest_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage guest contacts" ON public.guest_contacts;
CREATE POLICY "secretary_v2_guest_contacts_staff"
ON public.guest_contacts FOR ALL TO authenticated
USING (public.current_user_role() IN ('DOCTOR'::public.user_role, 'SECRETARY'::public.user_role, 'ADMIN'::public.user_role))
WITH CHECK (public.current_user_role() IN ('DOCTOR'::public.user_role, 'SECRETARY'::public.user_role, 'ADMIN'::public.user_role));

ALTER TABLE public.appointment_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for owners and staff on status history" ON public.appointment_status_history;
DROP POLICY IF EXISTS "Allow insert for owners and staff on status history" ON public.appointment_status_history;
CREATE POLICY "secretary_v2_status_history_select"
ON public.appointment_status_history FOR SELECT TO authenticated
USING (
  public.current_user_role() IN ('DOCTOR'::public.user_role, 'SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
  OR EXISTS (
    SELECT 1 FROM public.appointments AS a
    WHERE a.id = appointment_status_history.appointment_id AND a.patient_id = auth.uid()
  )
);
CREATE POLICY "secretary_v2_status_history_insert"
ON public.appointment_status_history FOR INSERT TO authenticated
WITH CHECK (
  public.current_user_role() IN ('DOCTOR'::public.user_role, 'SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
  OR EXISTS (
    SELECT 1 FROM public.appointments AS a
    WHERE a.id = appointment_status_history.appointment_id AND a.patient_id = auth.uid()
  )
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow write access to admin users" ON public.services;
DROP POLICY IF EXISTS "Allow write access to admin and secretary users" ON public.services;
CREATE POLICY "secretary_v2_services_write"
ON public.services FOR ALL TO authenticated
USING (public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role))
WITH CHECK (public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role));

ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff write access to doctor_schedules" ON public.doctor_schedules;
CREATE POLICY "secretary_v2_doctor_schedules_write"
ON public.doctor_schedules FOR ALL TO authenticated
USING (public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role))
WITH CHECK (public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role));

-- Outbox payloads include recipient data and are server/worker-only.
ALTER TABLE public.outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.outbox FROM anon, authenticated;

-- Query-plan support for the seven fresh list paths.
CREATE INDEX IF NOT EXISTS idx_appointments_status_created_at_id
  ON public.appointments (status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status_start_time
  ON public.appointments (date, status, start_time, id);
CREATE INDEX IF NOT EXISTS idx_appointments_no_show_unresolved_date
  ON public.appointments (date, status, created_at DESC, id DESC)
  WHERE status = 'NO_SHOW' AND no_show_resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_inquiries_status_created_at_id
  ON public.appointment_inquiries (status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_appointment_messages_appointment_created_at_id
  ON public.appointment_messages (appointment_id, created_at DESC, id DESC);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_appointment_inquiries_name_search_trgm
  ON public.appointment_inquiries USING gin ((lower(first_name || ' ' || last_name || ' ' || email || ' ' || phone_number)) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_guest_contacts_name_search_trgm
  ON public.guest_contacts USING gin ((lower(first_name || ' ' || coalesce(middle_name, '') || ' ' || last_name || ' ' || coalesce(email, '') || ' ' || coalesce(phone_number, ''))) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_name_search_trgm
  ON public.services USING gin (lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_name_email_search_trgm
  ON public.users USING gin ((lower(first_name || ' ' || last_name || ' ' || email)) gin_trgm_ops);

-- Normalize the appointment relationship once so communication pages do not
-- regex-cast JSON payloads on every request.
ALTER TABLE public.outbox ADD COLUMN IF NOT EXISTS appointment_id UUID;

CREATE OR REPLACE FUNCTION public.set_outbox_appointment_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.appointment_id := CASE
    WHEN NEW.payload->>'appointmentId' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN (NEW.payload->>'appointmentId')::UUID
    ELSE NULL
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_outbox_appointment_id ON public.outbox;
CREATE TRIGGER trg_set_outbox_appointment_id
BEFORE INSERT OR UPDATE OF payload ON public.outbox
FOR EACH ROW
EXECUTE FUNCTION public.set_outbox_appointment_id();

UPDATE public.outbox
SET appointment_id = CASE
  WHEN payload->>'appointmentId' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN (payload->>'appointmentId')::UUID
  ELSE NULL
END
WHERE appointment_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_outbox_appointment_created_at_id
  ON public.outbox (appointment_id, created_at DESC, id DESC)
  WHERE appointment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_outbox_appointment_status_created_at
  ON public.outbox (appointment_id, status, created_at DESC, id DESC)
  WHERE appointment_id IS NOT NULL;

-- A small authoritative summary table keeps Communication History reads
-- selective while remaining fresh through the outbox trigger. This is not a
-- cache: each outbox write updates the summary in the same transaction.
CREATE TABLE IF NOT EXISTS public.communication_activity_summaries (
  appointment_id UUID PRIMARY KEY REFERENCES public.appointments(id) ON DELETE CASCADE,
  last_activity TIMESTAMPTZ NOT NULL,
  has_failed BOOLEAN NOT NULL DEFAULT FALSE,
  failure_count BIGINT NOT NULL DEFAULT 0,
  has_email BOOLEAN NOT NULL DEFAULT FALSE,
  has_sms BOOLEAN NOT NULL DEFAULT FALSE,
  latest_event_type TEXT,
  latest_recipient TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.communication_activity_summaries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.communication_activity_summaries FROM anon, authenticated;

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
    BOOL_OR(o.status = 'FAILED'::public.outbox_status),
    COUNT(*) FILTER (WHERE o.status = 'FAILED'::public.outbox_status),
    BOOL_OR(o.event_type NOT LIKE '%_SMS' AND COALESCE(o.payload->>'email', o.payload->>'guestEmail') IS NOT NULL),
    BOOL_OR(o.event_type LIKE '%_SMS' OR COALESCE(o.payload->>'phoneNumber', o.payload->>'phone', o.payload->>'mobileNumber') IS NOT NULL),
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

REVOKE ALL ON FUNCTION public.refresh_communication_activity_summary(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_communication_activity_summary(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.refresh_communication_activity_summary_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_communication_activity_summary(OLD.appointment_id);
    RETURN OLD;
  END IF;
  PERFORM public.refresh_communication_activity_summary(NEW.appointment_id);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_communication_activity_summary_trigger() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_communication_activity_summary_trigger() TO service_role;

DROP TRIGGER IF EXISTS trg_refresh_communication_activity_summary ON public.outbox;
CREATE TRIGGER trg_refresh_communication_activity_summary
AFTER INSERT OR UPDATE OF status, event_type, payload OR DELETE ON public.outbox
FOR EACH ROW
EXECUTE FUNCTION public.refresh_communication_activity_summary_trigger();

INSERT INTO public.communication_activity_summaries (
  appointment_id, last_activity, has_failed, failure_count, has_email,
  has_sms, latest_event_type, latest_recipient, updated_at
)
SELECT
  o.appointment_id,
  MAX(o.created_at),
  BOOL_OR(o.status = 'FAILED'::public.outbox_status),
  COUNT(*) FILTER (WHERE o.status = 'FAILED'::public.outbox_status),
  BOOL_OR(o.event_type NOT LIKE '%_SMS' AND COALESCE(o.payload->>'email', o.payload->>'guestEmail') IS NOT NULL),
  BOOL_OR(o.event_type LIKE '%_SMS' OR COALESCE(o.payload->>'phoneNumber', o.payload->>'phone', o.payload->>'mobileNumber') IS NOT NULL),
  (ARRAY_AGG(o.event_type ORDER BY o.created_at DESC, o.id DESC))[1],
  (ARRAY_AGG(COALESCE(o.payload->>'email', o.payload->>'guestEmail', o.payload->>'phoneNumber', o.payload->>'phone', o.payload->>'mobileNumber', '') ORDER BY o.created_at DESC, o.id DESC))[1],
  NOW()
FROM public.outbox AS o
INNER JOIN public.appointments AS a ON a.id = o.appointment_id
WHERE o.appointment_id IS NOT NULL
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

-- Communication summary reads now use the normalized, transactionally
-- maintained summary instead of scanning every outbox payload.
CREATE OR REPLACE FUNCTION public.get_secretary_communication_summary_page(
  p_limit INT DEFAULT 25,
  p_cursor_last_activity TIMESTAMPTZ DEFAULT NULL,
  p_cursor_appointment_id UUID DEFAULT NULL,
  p_tab TEXT DEFAULT 'all',
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE(
  appointment_id UUID,
  patient_first_name TEXT,
  patient_last_name TEXT,
  dependent_first_name TEXT,
  dependent_last_name TEXT,
  guest_first_name TEXT,
  guest_last_name TEXT,
  service_name TEXT,
  date DATE,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  doctor_first_name TEXT,
  doctor_last_name TEXT,
  has_email BOOLEAN,
  has_sms BOOLEAN,
  last_activity TIMESTAMPTZ,
  has_failed BOOLEAN,
  failure_count BIGINT,
  latest_event_type TEXT,
  latest_recipient TEXT,
  total_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH filtered AS (
    SELECT
      a.id AS appointment_id,
      u.first_name AS patient_first_name,
      u.last_name AS patient_last_name,
      dep.first_name AS dependent_first_name,
      dep.last_name AS dependent_last_name,
      gc.first_name AS guest_first_name,
      gc.last_name AS guest_last_name,
      s.name AS service_name,
      a.date,
      a.start_time,
      a.end_time,
      d.first_name AS doctor_first_name,
      d.last_name AS doctor_last_name,
      c.has_email,
      c.has_sms,
      c.last_activity,
      c.has_failed,
      c.failure_count,
      c.latest_event_type,
      c.latest_recipient
    FROM public.communication_activity_summaries AS c
    INNER JOIN public.appointments AS a ON a.id = c.appointment_id
    LEFT JOIN public.users AS u ON u.id = a.patient_id
    LEFT JOIN public.dependents AS dep ON dep.id = a.dependent_id
    LEFT JOIN public.guest_contacts AS gc ON gc.appointment_id = a.id
    LEFT JOIN public.users AS d ON d.id = a.doctor_id
    LEFT JOIN public.services AS s ON s.id = a.service_id
    WHERE (p_tab <> 'failed' OR c.has_failed)
      AND (
        p_search IS NULL OR
        lower(COALESCE(u.first_name, '')) LIKE '%' || lower(p_search) || '%' OR
        lower(COALESCE(u.last_name, '')) LIKE '%' || lower(p_search) || '%' OR
        lower(COALESCE(dep.first_name, '')) LIKE '%' || lower(p_search) || '%' OR
        lower(COALESCE(dep.last_name, '')) LIKE '%' || lower(p_search) || '%' OR
        lower(COALESCE(gc.first_name, '')) LIKE '%' || lower(p_search) || '%' OR
        lower(COALESCE(gc.last_name, '')) LIKE '%' || lower(p_search) || '%' OR
        lower(COALESCE(s.name, '')) LIKE '%' || lower(p_search) || '%' OR
        lower(COALESCE(d.first_name, '')) LIKE '%' || lower(p_search) || '%' OR
        lower(COALESCE(d.last_name, '')) LIKE '%' || lower(p_search) || '%' OR
        lower(COALESCE(c.latest_event_type, '')) LIKE '%' || lower(p_search) || '%' OR
        lower(COALESCE(c.latest_recipient, '')) LIKE '%' || lower(p_search) || '%'
      )
  ), with_total AS (
    SELECT filtered.*, COUNT(*) OVER () AS total_count
    FROM filtered
  )
  SELECT
    w.appointment_id, w.patient_first_name, w.patient_last_name,
    w.dependent_first_name, w.dependent_last_name, w.guest_first_name,
    w.guest_last_name, w.service_name, w.date, w.start_time, w.end_time,
    w.doctor_first_name, w.doctor_last_name, w.has_email, w.has_sms,
    w.last_activity, w.has_failed, w.failure_count, w.latest_event_type,
    w.latest_recipient, w.total_count
  FROM with_total AS w
  WHERE p_cursor_last_activity IS NULL
     OR w.last_activity < p_cursor_last_activity
     OR (w.last_activity = p_cursor_last_activity AND w.appointment_id < p_cursor_appointment_id)
  ORDER BY w.last_activity DESC, w.appointment_id DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 100) + 1;
$$;

-- Staff-only wrapper provides an explicit SQL authorization gate while the
-- underlying service-role function remains unavailable to direct clients.
DROP FUNCTION IF EXISTS public.get_secretary_communication_summary_page_staff(INT, TIMESTAMPTZ, UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.get_secretary_communication_summary_page_staff(
  p_limit INT DEFAULT 25,
  p_cursor_last_activity TIMESTAMPTZ DEFAULT NULL,
  p_cursor_appointment_id UUID DEFAULT NULL,
  p_tab TEXT DEFAULT 'all',
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE(
  appointment_id UUID, patient_first_name TEXT, patient_last_name TEXT,
  dependent_first_name TEXT, dependent_last_name TEXT, guest_first_name TEXT,
  guest_last_name TEXT, service_name TEXT, date DATE, start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ, doctor_first_name TEXT, doctor_last_name TEXT,
  has_email BOOLEAN, has_sms BOOLEAN, last_activity TIMESTAMPTZ,
  has_failed BOOLEAN, failure_count BIGINT, latest_event_type TEXT,
  latest_recipient TEXT, total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_staff_access();
  RETURN QUERY
  SELECT * FROM public.get_secretary_communication_summary_page(
    p_limit, p_cursor_last_activity, p_cursor_appointment_id, p_tab, p_search
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_secretary_communication_summary_page(INT, TIMESTAMPTZ, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_secretary_communication_summary_page(INT, TIMESTAMPTZ, UUID, TEXT, TEXT) TO service_role;
REVOKE ALL ON FUNCTION public.get_secretary_communication_summary_page_staff(INT, TIMESTAMPTZ, UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_secretary_communication_summary_page_staff(INT, TIMESTAMPTZ, UUID, TEXT, TEXT) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_secretary_communication_summary_counts_staff(
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE(all_count BIGINT, failed_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_staff_access();
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE c.has_failed)::BIGINT
  FROM public.communication_activity_summaries AS c
  INNER JOIN public.appointments AS a ON a.id = c.appointment_id
  LEFT JOIN public.users AS u ON u.id = a.patient_id
  LEFT JOIN public.dependents AS dep ON dep.id = a.dependent_id
  LEFT JOIN public.guest_contacts AS gc ON gc.appointment_id = a.id
  LEFT JOIN public.users AS d ON d.id = a.doctor_id
  LEFT JOIN public.services AS s ON s.id = a.service_id
  WHERE p_search IS NULL OR
    lower(COALESCE(u.first_name, '')) LIKE '%' || lower(p_search) || '%' OR
    lower(COALESCE(u.last_name, '')) LIKE '%' || lower(p_search) || '%' OR
    lower(COALESCE(dep.first_name, '')) LIKE '%' || lower(p_search) || '%' OR
    lower(COALESCE(dep.last_name, '')) LIKE '%' || lower(p_search) || '%' OR
    lower(COALESCE(gc.first_name, '')) LIKE '%' || lower(p_search) || '%' OR
    lower(COALESCE(gc.last_name, '')) LIKE '%' || lower(p_search) || '%' OR
    lower(COALESCE(s.name, '')) LIKE '%' || lower(p_search) || '%' OR
    lower(COALESCE(d.first_name, '')) LIKE '%' || lower(p_search) || '%' OR
    lower(COALESCE(d.last_name, '')) LIKE '%' || lower(p_search) || '%' OR
    lower(COALESCE(c.latest_event_type, '')) LIKE '%' || lower(p_search) || '%' OR
    lower(COALESCE(c.latest_recipient, '')) LIKE '%' || lower(p_search) || '%';
END;
$$;

REVOKE ALL ON FUNCTION public.get_secretary_communication_summary_counts_staff(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_secretary_communication_summary_counts_staff(TEXT) TO authenticated, service_role;

-- Restrict chat RPCs. The application uses the staff wrapper below; the old
-- service-role functions remain available only to server-side callers.
REVOKE ALL ON FUNCTION public.get_secretary_chat_threads(INT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_secretary_chat_threads(INT, INT, INT) TO service_role;
REVOKE ALL ON FUNCTION public.get_secretary_chat_threads_page(INT, TIMESTAMPTZ, UUID, TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_secretary_chat_threads_page(INT, TIMESTAMPTZ, UUID, TEXT, TEXT, BOOLEAN) TO service_role;

CREATE OR REPLACE FUNCTION public.get_secretary_chat_threads_page_staff(
  p_limit INT DEFAULT 20,
  p_cursor_latest_message_created_at TIMESTAMPTZ DEFAULT NULL,
  p_cursor_appointment_id UUID DEFAULT NULL,
  p_tab TEXT DEFAULT 'ACTIVE',
  p_search TEXT DEFAULT NULL,
  p_unread_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  appointment_id UUID, patient_id UUID, status public.appointment_status,
  date DATE, preferred_start_time TEXT, start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ, service_id UUID, doctor_id UUID, chat_token TEXT,
  patient_first_name TEXT, patient_middle_name TEXT, patient_last_name TEXT,
  patient_suffix TEXT, patient_email TEXT, patient_phone TEXT,
  guest_first_name TEXT, guest_last_name TEXT, guest_middle_name TEXT,
  guest_suffix TEXT, guest_email TEXT, guest_phone TEXT,
  doctor_first_name TEXT, doctor_last_name TEXT, service_name TEXT,
  latest_message_text TEXT, latest_message_created_at TIMESTAMPTZ,
  latest_message_sender_role TEXT, unread_count BIGINT, confirmation_channel TEXT,
  email_confirmation_sent BOOLEAN, sms_confirmation_sent BOOLEAN,
  reminder_48h_sent BOOLEAN, email_reminder_48h_sent BOOLEAN,
  sms_reminder_48h_sent BOOLEAN, reminder_24h_sent BOOLEAN,
  email_reminder_24h_sent BOOLEAN, sms_reminder_24h_sent BOOLEAN,
  sort_created_at TIMESTAMPTZ, total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_staff_access();
  RETURN QUERY
  SELECT * FROM public.get_secretary_chat_threads_page(
    p_limit,
    p_cursor_latest_message_created_at,
    p_cursor_appointment_id,
    p_tab,
    p_search,
    p_unread_only
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_secretary_chat_threads_page_staff(INT, TIMESTAMPTZ, UUID, TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_secretary_chat_threads_page_staff(INT, TIMESTAMPTZ, UUID, TEXT, TEXT, BOOLEAN) TO authenticated, service_role;

-- Limit appointment trigger work to the columns each trigger actually reads.
-- This prevents edits to unrelated notes/contact fields from rebuilding
-- reminders, notifications, approval messages, or communication outbox rows.
DROP TRIGGER IF EXISTS trg_appointment_notifications ON public.appointments;
CREATE TRIGGER trg_appointment_notifications
AFTER INSERT OR UPDATE OF status ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_appointment_status_changes();

DROP TRIGGER IF EXISTS trg_appointment_status_change_outbox ON public.appointments;
CREATE TRIGGER trg_appointment_status_change_outbox
AFTER UPDATE OF status, date, start_time ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_on_appointment_status_change_outbox();

DROP TRIGGER IF EXISTS trg_appointment_approved_message ON public.appointments;
CREATE TRIGGER trg_appointment_approved_message
AFTER INSERT OR UPDATE OF status ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_on_appointment_approved();

DROP TRIGGER IF EXISTS trg_initialize_appointment_reminders ON public.appointments;
CREATE TRIGGER trg_initialize_appointment_reminders
BEFORE INSERT OR UPDATE OF date, start_time, confirmation_channel ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.initialize_appointment_reminders();

COMMIT;
