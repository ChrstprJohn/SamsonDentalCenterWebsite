-- ============================================================================
-- 🦷 Samson Dental - Generic Outbox Migration (Database-Driven Event Bus)
-- ============================================================================

CREATE TYPE outbox_status AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

CREATE TABLE outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status outbox_status DEFAULT 'PENDING'::outbox_status NOT NULL,
    error_logs TEXT,
    retry_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_outbox_modtime 
BEFORE UPDATE ON outbox 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- RPC: Concurrency-safe event claiming for Serverless workers
-- Uses FOR UPDATE SKIP LOCKED to grab rows without blocking other workers,
-- and instantly sets them to 'PROCESSING' before returning to the Next.js worker.
-- ============================================================================
CREATE OR REPLACE FUNCTION claim_pending_events(batch_size INT)
RETURNS SETOF outbox AS $$
BEGIN
    RETURN QUERY
    WITH locked_rows AS (
        SELECT id FROM outbox
        WHERE status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT claim_pending_events.batch_size
        FOR UPDATE SKIP LOCKED
    )
    UPDATE outbox
    SET status = 'PROCESSING'::outbox_status, updated_at = CURRENT_TIMESTAMP
    WHERE id IN (SELECT id FROM locked_rows)
    RETURNING *;
END;
$$ LANGUAGE plpgsql;
