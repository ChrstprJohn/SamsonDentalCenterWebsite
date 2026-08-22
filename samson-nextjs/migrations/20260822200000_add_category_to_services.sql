-- Migration: Add nullable category column to services table
-- Date: 2026-08-22
-- This column is used purely for the public services page display.
-- It is optional — NULL means uncategorized. No other pages read or write it.

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category TEXT NULL;

-- Seed categories for the 28 active services
UPDATE public.services SET category = 'Consultation'            WHERE name ILIKE '%consultation%';
UPDATE public.services SET category = 'Diagnostics'             WHERE name ILIKE '%periapical%' OR name ILIKE '%panoramic%' OR name ILIKE '%cephalometric%' OR name ILIKE '%cbct%' OR name ILIKE '%digital oral scanning%';
UPDATE public.services SET category = 'Preventive Dentistry'    WHERE name ILIKE '%oral prophylaxis%' OR name ILIKE '%fluoride%' OR name ILIKE '%sealants%';
UPDATE public.services SET category = 'Restorative Dentistry'   WHERE name ILIKE '%dental fillings%' OR name ILIKE '%inlays%' OR name ILIKE '%onlays%';
UPDATE public.services SET category = 'Prosthodontics'          WHERE name ILIKE '%crowns%' OR name ILIKE '%bridges%' OR name ILIKE '%dentures%';
UPDATE public.services SET category = 'Endodontics'             WHERE name ILIKE '%root canal%' OR name ILIKE '%apicoectomy%' OR name ILIKE '%pulpotomy%' OR name ILIKE '%pulpectomy%';
UPDATE public.services SET category = 'Cosmetic Dentistry'      WHERE name ILIKE '%whitening%' OR name ILIKE '%laser crown%' OR name ILIKE '%veneers%';
UPDATE public.services SET category = 'Orthodontics'            WHERE name ILIKE '%braces%' OR name ILIKE '%aligners%' OR name ILIKE '%retainers%' OR name ILIKE '%space maintainers%';
UPDATE public.services SET category = 'Oral Surgery and Implants' WHERE name ILIKE '%implants%' OR name ILIKE '%bone grafting%' OR name ILIKE '%sinus%' OR name ILIKE '%tooth extraction%' OR (name ILIKE '%extraction%' AND name NOT ILIKE '%tooth extraction%');
UPDATE public.services SET category = 'Specialized Care'        WHERE name ILIKE '%periodontal%' OR name ILIKE '%tmj%' OR name ILIKE '%tmd%' OR name ILIKE '%sleep appliance%' OR name ILIKE '%anti-snoring%' OR name ILIKE '%botox%';
