-- ============================================================================
-- Add processed_at to outbox: records when an event was actually sent/dispatched
-- (previously only created_at = queue time existed; delivery log showed queue
-- time as if it were send time).
-- ============================================================================

ALTER TABLE outbox ADD COLUMN processed_at TIMESTAMPTZ;

-- Backfill: for already-processed rows the last status transition (-> PROCESSED)
-- bumped updated_at via the modtime trigger, so it approximates send time.
UPDATE outbox
SET processed_at = updated_at
WHERE status = 'PROCESSED'::outbox_status AND processed_at IS NULL;

-- Reload PostgREST schema cache: hosted PostgREST caches table shapes and
-- keeps throwing "column not found in schema cache" until notified. Must run
-- AFTER the ALTER TABLE above or the cache still misses processed_at.
NOTIFY pgrst, 'reload schema';
