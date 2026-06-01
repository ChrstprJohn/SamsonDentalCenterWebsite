-- ============================================================================
-- 🦷 Samson Dental - Email Outbox Migration (Transactional Outbox Pattern)
-- Date: 2026-06-01
-- ============================================================================

CREATE TYPE email_status AS ENUM ('PENDING', 'SENT', 'FAILED');

CREATE TABLE email_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_name TEXT NOT NULL,
    payload JSONB NOT NULL,
    status email_status DEFAULT 'PENDING'::email_status NOT NULL,
    error_logs TEXT,
    retry_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_email_outbox_modtime 
BEFORE UPDATE ON email_outbox 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
