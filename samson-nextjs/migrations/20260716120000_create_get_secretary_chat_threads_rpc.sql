-- Migration: Create get_secretary_chat_threads RPC
-- Date: 2026-07-16
-- Purpose: Single-round-trip query for secretary chat inbox. Eliminates the
--          two-query + O(n) in-memory sort approach that was causing ~900ms latency.

CREATE OR REPLACE FUNCTION public.get_secretary_chat_threads(
    p_max_age_days INT DEFAULT 90,
    p_max_rows INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE(
    appointment_id UUID,
    status appointment_status,
    date DATE,
    preferred_start_time TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    service_id UUID,
    doctor_id UUID,
    chat_token TEXT,
    patient_first_name TEXT,
    patient_last_name TEXT,
    patient_middle_name TEXT,
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
    unread_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        a.id,
        a.status,
        a.date,
        a.preferred_start_time,
        a.start_time,
        a.end_time,
        a.service_id,
        a.doctor_id,
        a.chat_token,
        u.first_name,
        u.last_name,
        u.middle_name,
        u.suffix,
        u.email,
        u.phone_number,
        gc.first_name,
        gc.last_name,
        gc.middle_name,
        gc.suffix,
        gc.email,
        gc.phone_number,
        d.first_name,
        d.last_name,
        s.name,
        latest_msg.message,
        latest_msg.created_at,
        latest_msg.sender_role,
        COALESCE(unread.cnt, 0)
    FROM appointments a
    LEFT JOIN users u ON u.id = a.patient_id
    LEFT JOIN guest_contacts gc ON gc.appointment_id = a.id
    LEFT JOIN users d ON d.id = a.doctor_id
    LEFT JOIN services s ON s.id = a.service_id
    LEFT JOIN LATERAL (
        SELECT message, created_at, sender_role
        FROM appointment_messages
        WHERE appointment_id = a.id
        ORDER BY created_at DESC
        LIMIT 1
    ) latest_msg ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM appointment_messages
        WHERE appointment_id = a.id
          AND sender_role = 'PATIENT'
          AND is_read = false
    ) unread ON true
    WHERE a.patient_id IS NULL
      AND a.date >= (CURRENT_DATE - p_max_age_days)
      AND a.status != 'PENDING'
      AND gc.id IS NOT NULL
    ORDER BY latest_msg.created_at DESC NULLS LAST, a.date DESC
    LIMIT p_max_rows
    OFFSET p_offset;
$$;

COMMENT ON FUNCTION public.get_secretary_chat_threads IS 'Returns chat threads for secretary inbox with latest message and unread counts in a single query';
