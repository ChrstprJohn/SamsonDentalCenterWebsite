-- Migration: Add optional display ranking to services
-- NULL = unranked (sorted last, alphabetical). Set later via edit form —
-- creating a service still works without it.

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS ranking INTEGER;