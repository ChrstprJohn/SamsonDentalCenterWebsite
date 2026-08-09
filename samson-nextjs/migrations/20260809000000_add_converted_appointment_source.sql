-- Migration: Add CONVERTED source for appointments converted from online inquiries
-- Date: 2026-08-09
-- Standalone: ALTER TYPE ... ADD VALUE cannot share a transaction with usage of the new value.

ALTER TYPE public.appointment_source ADD VALUE IF NOT EXISTS 'CONVERTED';
