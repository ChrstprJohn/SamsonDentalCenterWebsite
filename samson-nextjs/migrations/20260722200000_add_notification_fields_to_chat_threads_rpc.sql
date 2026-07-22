-- Migration: Add notification fields to get_secretary_chat_threads RPC
-- Date: 2026-07-22
-- Purpose: The chat inbox Appointment Details > Notification History always showed
--          PENDING because the RPC did not return any notification tracking columns.
--          This version adds all six per-channel sent flags plus the two legacy flags.

-- Drop ALL overloads of this function regardless of argument types
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT oid::regprocedure AS sig
        FROM pg_proc
        WHERE proname = 'get_secretary_chat_threads'
          AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig;
    END LOOP;
END $$;

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
    unread_count BIGINT,
    -- notification tracking columns (added)
    confirmation_channel TEXT,
    email_confirmation_sent BOOLEAN,
    sms_confirmation_sent BOOLEAN,
    reminder_48h_sent BOOLEAN,
    email_reminder_48h_sent BOOLEAN,
    sms_reminder_48h_sent BOOLEAN,
    reminder_24h_sent BOOLEAN,
    email_reminder_24h_sent BOOLEAN,
    sms_reminder_24h_sent BOOLEAN
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
        COALESCE(unread.cnt, 0),
        -- notification tracking columns
        COALESCE(a.confirmation_channel::TEXT, 'EMAIL'),
        COALESCE(a.email_confirmation_sent, false),
        COALESCE(a.sms_confirmation_sent, false),
        COALESCE(a.reminder_48h_sent, false),
        COALESCE(a.email_reminder_48h_sent, false),
        COALESCE(a.sms_reminder_48h_sent, false),
        COALESCE(a.reminder_24h_sent, false),
        COALESCE(a.email_reminder_24h_sent, false),
        COALESCE(a.sms_reminder_24h_sent, false)
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

COMMENT ON FUNCTION public.get_secretary_chat_threads IS 'Returns chat threads for secretary inbox with latest message, unread counts, and all notification tracking fields in a single query';
