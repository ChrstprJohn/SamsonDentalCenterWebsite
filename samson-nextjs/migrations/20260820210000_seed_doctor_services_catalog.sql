-- Migration: Re-map new catalog services to all active doctors
-- Fixes 20260820_replace_services_catalog.sql, which DELETEd all
-- doctor_services rows but never re-created mappings for the 16 new
-- catalog services. Availability queries filter doctors by this junction,
-- so empty mappings = zero bookable slots.

INSERT INTO public.doctor_services (doctor_id, service_id)
SELECT u.id, s.id
FROM public.users u
CROSS JOIN public.services s
WHERE u.role = 'DOCTOR'
  AND u.status IN ('ACTIVE', 'HIDDEN')
  AND s.name IN ('Consultation', 'Oral Prophylaxis', 'Dental Fillings', 'Extraction', 'Denture',
                 'Crown or Fixed Bridge', 'Odentectomy', 'Root Canal Treatment', 'X-ray',
                 'Orthodontic Treatment', 'Aligners', 'Sleep Appliance', 'TMJ Problem / Splint',
                 'Implant', 'CBCT', 'Laser Treatment')
ON CONFLICT (doctor_id, service_id) DO NOTHING;