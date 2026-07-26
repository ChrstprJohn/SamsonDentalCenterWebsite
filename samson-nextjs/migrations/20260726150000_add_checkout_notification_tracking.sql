-- Migration: Add separate email and sms tracking columns for Checkout / Thank You notification
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS email_checkout_sent BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_checkout_sent BOOLEAN NOT NULL DEFAULT FALSE;
