-- Migration: Replace services catalog with 16 standard services
-- Date: 2026-08-20
-- Old rows are deleted. References in appointments / appointment_inquiries /
-- appointment_treatments are remapped to the closest new service by name
-- (columns are NOT NULL + ON DELETE RESTRICT, so remap-then-delete).

BEGIN;

-- 1. Remove doctor-service mappings (junction is ON DELETE CASCADE, cleared cleanly)
DELETE FROM public.doctor_services;

-- 2. Deactivate old catalog rows (keeps history valid for RESTRICT FKs)
UPDATE public.services SET is_active = false, status = 'ARCHIVED'::public.service_status
WHERE name IN ('Oral Prophylaxis (Teeth Cleaning)', 'Tooth Extraction', 'Root Canal Therapy',
               'Orthodontic Consultation', 'Composite Filling');

-- 3. Remap references from old services to their new equivalents
--    Oral Prophylaxis (Teeth Cleaning)   -> Oral Prophylaxis
--    Tooth Extraction                    -> Extraction
--    Root Canal Therapy                  -> Root Canal Treatment
--    Orthodontic Consultation            -> Consultation
--    Composite Filling                   -> Dental Fillings
UPDATE public.appointments a
SET service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Oral Prophylaxis (Teeth Cleaning)' AND s_new.name = 'Oral Prophylaxis'
  AND a.service_id = s_old.id;

UPDATE public.appointments a
SET service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Tooth Extraction' AND s_new.name = 'Extraction'
  AND a.service_id = s_old.id;

UPDATE public.appointments a
SET service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Root Canal Therapy' AND s_new.name = 'Root Canal Treatment'
  AND a.service_id = s_old.id;

UPDATE public.appointments a
SET service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Orthodontic Consultation' AND s_new.name = 'Consultation'
  AND a.service_id = s_old.id;

UPDATE public.appointments a
SET service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Composite Filling' AND s_new.name = 'Dental Fillings'
  AND a.service_id = s_old.id;

-- Same remap for appointment_inquiries.preferred_service_id
UPDATE public.appointment_inquiries ai
SET preferred_service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Oral Prophylaxis (Teeth Cleaning)' AND s_new.name = 'Oral Prophylaxis'
  AND ai.preferred_service_id = s_old.id;

UPDATE public.appointment_inquiries ai
SET preferred_service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Tooth Extraction' AND s_new.name = 'Extraction'
  AND ai.preferred_service_id = s_old.id;

UPDATE public.appointment_inquiries ai
SET preferred_service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Root Canal Therapy' AND s_new.name = 'Root Canal Treatment'
  AND ai.preferred_service_id = s_old.id;

UPDATE public.appointment_inquiries ai
SET preferred_service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Orthodontic Consultation' AND s_new.name = 'Consultation'
  AND ai.preferred_service_id = s_old.id;

UPDATE public.appointment_inquiries ai
SET preferred_service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Composite Filling' AND s_new.name = 'Dental Fillings'
  AND ai.preferred_service_id = s_old.id;

-- Same remap for appointment_treatments.service_id
UPDATE public.appointment_treatments at_t
SET service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Oral Prophylaxis (Teeth Cleaning)' AND s_new.name = 'Oral Prophylaxis'
  AND at_t.service_id = s_old.id;

UPDATE public.appointment_treatments at_t
SET service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Tooth Extraction' AND s_new.name = 'Extraction'
  AND at_t.service_id = s_old.id;

UPDATE public.appointment_treatments at_t
SET service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Root Canal Therapy' AND s_new.name = 'Root Canal Treatment'
  AND at_t.service_id = s_old.id;

UPDATE public.appointment_treatments at_t
SET service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Orthodontic Consultation' AND s_new.name = 'Consultation'
  AND at_t.service_id = s_old.id;

UPDATE public.appointment_treatments at_t
SET service_id = s_new.id
FROM public.services s_old, public.services s_new
WHERE s_old.name = 'Composite Filling' AND s_new.name = 'Dental Fillings'
  AND at_t.service_id = s_old.id;

-- 4. Delete old catalog rows
DELETE FROM public.services
WHERE name IN ('Oral Prophylaxis (Teeth Cleaning)', 'Tooth Extraction', 'Root Canal Therapy',
               'Orthodontic Consultation', 'Composite Filling');

-- 4b. Clear previous new-catalog rows so the migration is re-runnable
DELETE FROM public.services
WHERE name IN ('Consultation', 'Oral Prophylaxis', 'Dental Fillings', 'Extraction', 'Denture',
               'Crown or Fixed Bridge', 'Odentectomy', 'Root Canal Treatment', 'X-ray',
               'Orthodontic Treatment', 'Aligners', 'Sleep Appliance', 'TMJ Problem / Splint',
               'Implant', 'CBCT', 'Laser Treatment');

-- 5. Insert new catalog
INSERT INTO public.services (name, description, duration_minutes, price, service_type, is_active) VALUES
('Consultation', 'Initial dental exam and treatment planning.', 30, NULL, 'GENERAL', true),
('Oral Prophylaxis', 'Professional teeth cleaning, scaling and polishing.', 45, NULL, 'GENERAL', true),
('Dental Fillings', 'Tooth decay restored with tooth-colored composite.', 30, NULL, 'GENERAL', true),
('Extraction', 'Simple and surgical tooth removal.', 45, NULL, 'GENERAL', true),
('Denture', 'Full or partial removable tooth replacements.', 60, NULL, 'GENERAL', true),
('Crown or Fixed Bridge', 'Caps damaged teeth or bridges gaps permanently.', 90, NULL, 'GENERAL', true),
('Odentectomy', 'Surgical removal of impacted wisdom teeth.', 60, NULL, 'SPECIALIZED', true),
('Root Canal Treatment', 'Saves severely decayed or infected teeth.', 75, NULL, 'SPECIALIZED', true),
('X-ray', 'Digital imaging for diagnosis.', 15, NULL, 'GENERAL', true),
('Orthodontic Treatment', 'Braces and appliances to straighten teeth.', 60, NULL, 'SPECIALIZED', true),
('Aligners', 'Clear removable trays for discreet straightening.', 30, NULL, 'SPECIALIZED', true),
('Sleep Appliance', 'Oral device for snoring and sleep apnea.', 45, NULL, 'SPECIALIZED', true),
('TMJ Problem / Splint', 'Relief for jaw pain with custom occlusal splint.', 45, NULL, 'SPECIALIZED', true),
('Implant', 'Permanent titanium tooth root replacement.', 90, NULL, 'SPECIALIZED', true),
('CBCT', '3D cone-beam scan for surgical planning.', 20, NULL, 'SPECIALIZED', true),
('Laser Treatment', 'Minimally invasive laser dental procedures.', 30, NULL, 'SPECIALIZED', true);

COMMIT;