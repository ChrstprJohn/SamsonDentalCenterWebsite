-- Secretary left-list pagination: communication summaries and stable keyset indexes.

CREATE INDEX IF NOT EXISTS idx_appointments_created_at_id
  ON public.appointments (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_outbox_created_at_id
  ON public.outbox (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_outbox_status_created_at
  ON public.outbox (status, created_at DESC, id DESC);

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
  WITH raw_activity AS (
    SELECT
      o.id,
      o.created_at,
      o.status,
      o.event_type,
      o.payload,
      CASE
        WHEN o.payload->>'appointmentId' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN (o.payload->>'appointmentId')::UUID
        ELSE NULL
      END AS appointment_id
    FROM public.outbox o
    WHERE o.payload ? 'appointmentId'
  ),
  activity AS (
    SELECT
      appointment_id,
      MAX(created_at) AS last_activity,
      BOOL_OR(status = 'FAILED') AS has_failed,
      COUNT(*) FILTER (WHERE status = 'FAILED') AS failure_count,
      BOOL_OR(event_type NOT LIKE '%_SMS' AND COALESCE(payload->>'phoneNumber', payload->>'phone', payload->>'mobileNumber') IS NULL) AS has_email,
      BOOL_OR(event_type LIKE '%_SMS' OR COALESCE(payload->>'phoneNumber', payload->>'phone', payload->>'mobileNumber') IS NOT NULL) AS has_sms,
      (ARRAY_AGG(event_type ORDER BY created_at DESC, id DESC))[1] AS latest_event_type,
      (ARRAY_AGG(COALESCE(payload->>'email', payload->>'guestEmail', payload->>'phoneNumber', payload->>'phone', payload->>'mobileNumber', '') ORDER BY created_at DESC, id DESC))[1] AS latest_recipient
    FROM raw_activity
    WHERE appointment_id IS NOT NULL
    GROUP BY appointment_id
  ),
  filtered AS (
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
      act.has_email,
      act.has_sms,
      act.last_activity,
      act.has_failed,
      act.failure_count,
      act.latest_event_type,
      act.latest_recipient
    FROM activity act
    INNER JOIN public.appointments a ON a.id = act.appointment_id
    LEFT JOIN public.users u ON u.id = a.patient_id
    LEFT JOIN public.dependents dep ON dep.id = a.dependent_id
    LEFT JOIN public.guest_contacts gc ON gc.appointment_id = a.id
    LEFT JOIN public.users d ON d.id = a.doctor_id
    LEFT JOIN public.services s ON s.id = a.service_id
    WHERE (p_tab <> 'failed' OR act.has_failed)
      AND (
        p_search IS NULL OR
        CONCAT_WS(' ', u.first_name, u.last_name, dep.first_name, dep.last_name, gc.first_name, gc.last_name, s.name, d.first_name, d.last_name, act.latest_event_type, act.latest_recipient) ILIKE '%' || p_search || '%'
      )
  ),
  with_total AS (
    SELECT filtered.*, COUNT(*) OVER () AS total_count
    FROM filtered
  )
  SELECT
    w.appointment_id,
    w.patient_first_name,
    w.patient_last_name,
    w.dependent_first_name,
    w.dependent_last_name,
    w.guest_first_name,
    w.guest_last_name,
    w.service_name,
    w.date,
    w.start_time,
    w.end_time,
    w.doctor_first_name,
    w.doctor_last_name,
    w.has_email,
    w.has_sms,
    w.last_activity,
    w.has_failed,
    w.failure_count,
    w.latest_event_type,
    w.latest_recipient,
    w.total_count
  FROM with_total w
  WHERE p_cursor_last_activity IS NULL
     OR w.last_activity < p_cursor_last_activity
     OR (w.last_activity = p_cursor_last_activity AND w.appointment_id < p_cursor_appointment_id)
  ORDER BY w.last_activity DESC, w.appointment_id DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 100) + 1;
$$;

COMMENT ON FUNCTION public.get_secretary_communication_summary_page IS
  'Returns cursor-paginated secretary communication summaries with server-side tab/search filters and exact filtered totals.';

CREATE OR REPLACE FUNCTION public.get_secretary_chat_threads_page(
  p_limit INT DEFAULT 20,
  p_cursor_latest_message_created_at TIMESTAMPTZ DEFAULT NULL,
  p_cursor_appointment_id UUID DEFAULT NULL,
  p_tab TEXT DEFAULT 'ACTIVE',
  p_search TEXT DEFAULT NULL,
  p_unread_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  appointment_id UUID,
  patient_id UUID,
  status appointment_status,
  date DATE,
  preferred_start_time TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  service_id UUID,
  doctor_id UUID,
  chat_token TEXT,
  patient_first_name TEXT,
  patient_middle_name TEXT,
  patient_last_name TEXT,
  patient_suffix TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  guest_first_name TEXT,
  guest_last_name TEXT,
  guest_middle_name TEXT,
  guest_suffix TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  doctor_first_name TEXT,
  doctor_last_name TEXT,
  service_name TEXT,
  latest_message_text TEXT,
  latest_message_created_at TIMESTAMPTZ,
  latest_message_sender_role TEXT,
  unread_count BIGINT,
  confirmation_channel TEXT,
  email_confirmation_sent BOOLEAN,
  sms_confirmation_sent BOOLEAN,
  reminder_48h_sent BOOLEAN,
  email_reminder_48h_sent BOOLEAN,
  sms_reminder_48h_sent BOOLEAN,
  reminder_24h_sent BOOLEAN,
  email_reminder_24h_sent BOOLEAN,
  sms_reminder_24h_sent BOOLEAN,
  sort_created_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      a.id AS appointment_id,
      a.patient_id,
      a.status,
      a.date,
      a.preferred_start_time,
      a.start_time,
      a.end_time,
      a.service_id,
      a.doctor_id,
      a.chat_token,
      u.first_name AS patient_first_name,
      u.middle_name AS patient_middle_name,
      u.last_name AS patient_last_name,
      u.suffix AS patient_suffix,
      u.email AS patient_email,
      u.phone_number AS patient_phone,
      gc.first_name AS guest_first_name,
      gc.last_name AS guest_last_name,
      gc.middle_name AS guest_middle_name,
      gc.suffix AS guest_suffix,
      gc.email AS guest_email,
      gc.phone_number AS guest_phone,
      d.first_name AS doctor_first_name,
      d.last_name AS doctor_last_name,
      s.name AS service_name,
      latest_msg.message AS latest_message_text,
      latest_msg.created_at AS latest_message_created_at,
      latest_msg.sender_role AS latest_message_sender_role,
      COALESCE(unread.cnt, 0) AS unread_count,
      COALESCE(a.confirmation_channel::TEXT, 'EMAIL') AS confirmation_channel,
      COALESCE(a.email_confirmation_sent, false) AS email_confirmation_sent,
      COALESCE(a.sms_confirmation_sent, false) AS sms_confirmation_sent,
      COALESCE(a.reminder_48h_sent, false) AS reminder_48h_sent,
      COALESCE(a.email_reminder_48h_sent, false) AS email_reminder_48h_sent,
      COALESCE(a.sms_reminder_48h_sent, false) AS sms_reminder_48h_sent,
      COALESCE(a.reminder_24h_sent, false) AS reminder_24h_sent,
      COALESCE(a.email_reminder_24h_sent, false) AS email_reminder_24h_sent,
      COALESCE(a.sms_reminder_24h_sent, false) AS sms_reminder_24h_sent,
      COALESCE(latest_msg.created_at, '0001-01-01 00:00:00+00'::TIMESTAMPTZ) AS sort_created_at
    FROM public.appointments a
    LEFT JOIN public.users u ON u.id = a.patient_id
    INNER JOIN public.guest_contacts gc ON gc.appointment_id = a.id
    LEFT JOIN public.users d ON d.id = a.doctor_id
    LEFT JOIN public.services s ON s.id = a.service_id
    LEFT JOIN LATERAL (
      SELECT message, created_at, sender_role
      FROM public.appointment_messages
      WHERE appointment_id = a.id
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    ) latest_msg ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS cnt
      FROM public.appointment_messages
      WHERE appointment_id = a.id
        AND sender_role = 'PATIENT'
        AND is_read = false
    ) unread ON true
    WHERE a.patient_id IS NULL
      AND a.date >= (CURRENT_DATE - 90)
      AND a.status::TEXT <> 'PENDING'
      AND (
        (p_tab = 'ACTIVE' AND a.status::TEXT IN ('APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'))
        OR (p_tab <> 'ACTIVE' AND a.status::TEXT NOT IN ('APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'))
      )
      AND (NOT p_unread_only OR COALESCE(unread.cnt, 0) > 0)
      AND (
        p_search IS NULL OR
        CONCAT_WS(' ', gc.first_name, gc.last_name, gc.email, gc.phone_number, s.name, d.first_name, d.last_name, latest_msg.message) ILIKE '%' || p_search || '%'
      )
  ),
  with_total AS (
    SELECT base.*, COUNT(*) OVER () AS total_count
    FROM base
  )
  SELECT
    w.appointment_id,
    w.patient_id,
    w.status,
    w.date,
    w.preferred_start_time,
    w.start_time,
    w.end_time,
    w.service_id,
    w.doctor_id,
    w.chat_token,
    w.patient_first_name,
    w.patient_middle_name,
    w.patient_last_name,
    w.patient_suffix,
    w.patient_email,
    w.patient_phone,
    w.guest_first_name,
    w.guest_last_name,
    w.guest_middle_name,
    w.guest_suffix,
    w.guest_email,
    w.guest_phone,
    w.doctor_first_name,
    w.doctor_last_name,
    w.service_name,
    w.latest_message_text,
    w.latest_message_created_at,
    w.latest_message_sender_role,
    w.unread_count,
    w.confirmation_channel,
    w.email_confirmation_sent,
    w.sms_confirmation_sent,
    w.reminder_48h_sent,
    w.email_reminder_48h_sent,
    w.sms_reminder_48h_sent,
    w.reminder_24h_sent,
    w.email_reminder_24h_sent,
    w.sms_reminder_24h_sent,
    w.sort_created_at,
    w.total_count
  FROM with_total w
  WHERE p_cursor_latest_message_created_at IS NULL
     OR w.sort_created_at < p_cursor_latest_message_created_at
     OR (w.sort_created_at = p_cursor_latest_message_created_at AND w.appointment_id < p_cursor_appointment_id)
  ORDER BY w.sort_created_at DESC, w.appointment_id DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 100) + 1;
$$;

COMMENT ON FUNCTION public.get_secretary_chat_threads_page IS
  'Returns cursor-paginated secretary chat threads with server-side tab, search, and unread filters.';
