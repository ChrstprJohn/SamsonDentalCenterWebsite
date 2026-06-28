-- Migration: Clean up duplicate services and remap references
-- Date: 2026-06-24

-- Create temporary table to hold duplicate metadata
CREATE TEMP TABLE temp_duplicate_services AS
SELECT id, name,
       ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(name)) ORDER BY created_at ASC) as rn,
       FIRST_VALUE(id) OVER (PARTITION BY LOWER(TRIM(name)) ORDER BY created_at ASC) as original_id
FROM public.services;

-- 1. Update doctor_services
UPDATE public.doctor_services ds
SET service_id = ds_dup.original_id
FROM temp_duplicate_services ds_dup
WHERE ds.service_id = ds_dup.id AND ds_dup.rn > 1;

-- 2. Update appointments
UPDATE public.appointments a
SET service_id = ds_dup.original_id
FROM temp_duplicate_services ds_dup
WHERE a.service_id = ds_dup.id AND ds_dup.rn > 1;

-- 3. Update appointment_inquiries
UPDATE public.appointment_inquiries ai
SET preferred_service_id = ds_dup.original_id
FROM temp_duplicate_services ds_dup
WHERE ai.preferred_service_id = ds_dup.id AND ds_dup.rn > 1;

-- 4. Update appointment_treatments
UPDATE public.appointment_treatments at_t
SET service_id = ds_dup.original_id
FROM temp_duplicate_services ds_dup
WHERE at_t.service_id = ds_dup.id AND ds_dup.rn > 1;

-- 5. Delete duplicate doctor_services mappings that might now conflict
DELETE FROM public.doctor_services ds
WHERE EXISTS (
  SELECT 1 FROM public.doctor_services ds2 
  WHERE ds2.doctor_id = ds.doctor_id 
    AND ds2.service_id = ds.service_id 
    AND ds2.ctid > ds.ctid
);

-- 6. Delete duplicate service rows
DELETE FROM public.services
WHERE id IN (SELECT id FROM temp_duplicate_services WHERE rn > 1);

-- Drop the temporary table
DROP TABLE temp_duplicate_services;
