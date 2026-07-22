-- Migration: Add confirmation_sent and payment_receipt_sent to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_receipt_sent BOOLEAN NOT NULL DEFAULT FALSE;
