-- Migration: Add doctor_assignment_source enum and column to appointments table

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doctor_assignment_source') THEN
    CREATE TYPE doctor_assignment_source AS ENUM ('SYSTEM', 'USER');
  END IF;
END $$;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS doctor_assignment_source doctor_assignment_source DEFAULT 'SYSTEM'::doctor_assignment_source NOT NULL;
