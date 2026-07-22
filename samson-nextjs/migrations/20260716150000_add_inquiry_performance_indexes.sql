-- Migration: Add composite indexes for appointment inquiries queue performance
-- Date: 2026-07-16
-- Purpose: Speed up inquiry status filtering and sorting in secretary dashboard

-- Composite index for inquiries filtering and ordering (status + created_at DESC)
CREATE INDEX IF NOT EXISTS idx_appointment_inquiries_status_created_at
ON public.appointment_inquiries(status, created_at DESC);
