-- Migration: Add outbox event_type index for fast category filtering (Inquiries vs Appointments)
-- Date: 2026-08-04

CREATE INDEX IF NOT EXISTS idx_outbox_event_type_created_at
  ON public.outbox (event_type, created_at DESC, id DESC);

COMMENT ON INDEX public.idx_outbox_event_type_created_at IS
  'Optimizes filtering outbox logs by event category (Inquiries & Rejections vs Appointments) in communication logs.';
