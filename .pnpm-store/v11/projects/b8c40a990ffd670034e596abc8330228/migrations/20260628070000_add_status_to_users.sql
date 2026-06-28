-- Migration: Add status column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'HIDDEN', 'ARCHIVED')) NOT NULL;

-- Set status to ARCHIVED if is_active is false, otherwise ACTIVE
UPDATE public.users
SET status = CASE 
    WHEN is_active = false THEN 'ARCHIVED'
    ELSE 'ACTIVE'
END;
