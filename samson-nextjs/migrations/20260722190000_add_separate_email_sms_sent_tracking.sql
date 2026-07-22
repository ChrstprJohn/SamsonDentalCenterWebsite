-- Migration: Add separate email and sms sent tracking columns to appointments table
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS email_confirmation_sent BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_confirmation_sent BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_reminder_48h_sent BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_reminder_48h_sent BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_reminder_24h_sent BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_reminder_24h_sent BOOLEAN NOT NULL DEFAULT FALSE;
