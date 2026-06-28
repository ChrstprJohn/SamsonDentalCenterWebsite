-- Migration: Add status column to services table and migrate existing records

-- Create the status enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_status') THEN
        CREATE TYPE service_status AS ENUM ('ACTIVE', 'HIDDEN', 'ARCHIVED');
    END IF;
END
$$;

-- Add status column to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS status service_status DEFAULT 'ACTIVE'::service_status NOT NULL;

-- Migrate existing records
-- Existing active services get ACTIVE status
-- Existing inactive services get HIDDEN status by default
UPDATE public.services 
SET status = CASE 
    WHEN is_active = true THEN 'ACTIVE'::service_status
    ELSE 'HIDDEN'::service_status
END;
