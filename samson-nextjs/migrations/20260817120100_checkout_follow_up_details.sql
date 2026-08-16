-- Migration: Add details JSONB column to checkout_follow_up_responses
-- Date: 2026-08-17
-- Reason: wellbeing form v2 stores medsTaken/medsManageable/symptoms/callBack as JSON.
-- NOTE: original migration (20260817120000) was already applied to some environments;
-- this additive column must exist in every environment. IF NOT EXISTS keeps it idempotent.

ALTER TABLE public.checkout_follow_up_responses
ADD COLUMN IF NOT EXISTS details JSONB;