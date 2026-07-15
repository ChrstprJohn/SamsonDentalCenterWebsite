-- Migration: Add composite indexes for chat performance
-- Date: 2026-07-15
-- Purpose: Speed up message ordering, pagination, and unread count queries

-- Composite index for message ordering and pagination (appointment_id + created_at DESC)
CREATE INDEX IF NOT EXISTS idx_appointment_messages_appointment_id_created_at
ON public.appointment_messages(appointment_id, created_at DESC);

-- Composite index for unread count queries (appointment_id + sender_role + is_read)
CREATE INDEX IF NOT EXISTS idx_appointment_messages_unread_count
ON public.appointment_messages(appointment_id, sender_role, is_read)
WHERE sender_role = 'PATIENT' AND is_read = FALSE;
