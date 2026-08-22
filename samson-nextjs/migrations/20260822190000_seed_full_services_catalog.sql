-- Migration: Seed full services catalog
-- Date: 2026-08-22
-- Inserts all 28 services across 10 categories.
-- ranking is NULL (unranked) as requested.

INSERT INTO public.services (name, description, duration_minutes, price, service_type, is_active, ranking) VALUES

-- Consultation
('Consultation',
 'Comprehensive oral examination, clinical assessment, and personalized treatment planning with our dental specialists.',
 30, NULL, 'GENERAL', true, NULL),

-- Diagnostics
('Periapical Digital X-ray',
 'High-resolution close-up imaging of individual teeth to detect hidden decay, root conditions, and bone levels.',
 15, NULL, 'GENERAL', true, NULL),

('Panoramic and Cephalometric Digital X-ray',
 'Full-mouth panoramic scan and orthodontic skull imaging for overall jaw alignment, wisdom teeth evaluation, and structural analysis.',
 20, NULL, 'GENERAL', true, NULL),

('CBCT',
 'Advanced 3D Cone Beam Computed Tomography volumetric imaging for precise implant planning and complex surgical navigation.',
 20, NULL, 'SPECIALIZED', true, NULL),

('Digital Oral Scanning and Smile Designing',
 'Intraoral 3D optical scanning for comfortable, highly accurate digital impressions and aesthetic smile simulation.',
 30, NULL, 'SPECIALIZED', true, NULL),

-- Orthodontics
('Traditional Metal Braces',
 'Reliable orthodontic brackets and archwires engineered for comprehensive correction of complex alignment and bite issues.',
 60, NULL, 'SPECIALIZED', true, NULL),

('Clear Aligners',
 'Discreet, removable transparent aligner trays that gently shift teeth into proper position without metal hardware. Available as Invisalign and Realigner.',
 30, NULL, 'SPECIALIZED', true, NULL),

('Retainers and Space Maintainers',
 'Custom fixed or removable appliances to preserve teeth in their corrected positions post-treatment or hold space for growing teeth.',
 30, NULL, 'SPECIALIZED', true, NULL),

-- Preventive Dentistry
('Oral Prophylaxis',
 'Professional ultrasonic scaling and polishing to eliminate plaque, calculus (tartar), and surface stains for optimal gum health.',
 45, NULL, 'GENERAL', true, NULL),

('Fluoride Treatments',
 'Enamel-strengthening mineral application to protect teeth against cavities and reduce sensitivity.',
 15, NULL, 'GENERAL', true, NULL),

-- Endodontics
('Root Canal Treatment',
 'Specialized therapy to remove infected dental pulp, thoroughly disinfect the canal system, and save the natural tooth.',
 75, NULL, 'SPECIALIZED', true, NULL),

('Apicoectomy',
 'Microsurgical procedure to remove persistent infection at the root tip and seal the canal terminus.',
 60, NULL, 'SPECIALIZED', true, NULL),

('Pulpotomy / Pulpectomy',
 'Targeted vital pulp therapy or emergency pulp removal to relieve severe pain and preserve compromised teeth.',
 45, NULL, 'SPECIALIZED', true, NULL),

-- Cosmetic Dentistry
('Tooth Whitening',
 'Safe, clinically proven whitening treatments designed to lift stubborn deep stains and brighten your smile. Available chair-side or as a take-home kit.',
 60, NULL, 'GENERAL', true, NULL),

('Laser Crown Lengthening',
 'Gentle laser recontouring of gum tissue to expose more natural tooth structure for cosmetic balance or restorations.',
 45, NULL, 'SPECIALIZED', true, NULL),

('Veneers',
 'Ultra-thin handcrafted ceramic or composite facings bonded to front teeth to perfect color, shape, and alignment. Available in porcelain and composite.',
 90, NULL, 'SPECIALIZED', true, NULL),

-- Preventive (Sealants grouped here)
('Sealants',
 'Protective resin coating applied to the chewing surfaces of back teeth to prevent food trapping and cavity formation.',
 20, NULL, 'GENERAL', true, NULL),

-- Oral Surgery and Implants
('Dental Implants',
 'Biocompatible titanium fixtures surgically anchored into the jawbone to serve as permanent artificial tooth roots.',
 90, NULL, 'SPECIALIZED', true, NULL),

('Bone Grafting and Sinus Implants',
 'Advanced regenerative procedures to augment deficient jawbone volume and create a solid anchor for implants.',
 90, NULL, 'SPECIALIZED', true, NULL),

('Tooth Extraction',
 'Gentle and precise removal of severely damaged, non-restorable, or problematic teeth under local anesthesia. Available as simple, complex, or impacted.',
 45, NULL, 'GENERAL', true, NULL),

-- Specialized Care
('Periodontal Treatments for Gum Disease',
 'Deep scaling, root planing, and therapeutic antimicrobial care to halt active gum infections and bone loss.',
 60, NULL, 'SPECIALIZED', true, NULL),

('TMJ / TMD Therapy',
 'Comprehensive diagnosis and therapeutic solutions including custom splints to relieve jaw joint pain, clicking, and clenching.',
 60, NULL, 'SPECIALIZED', true, NULL),

('Sleep Appliance (Anti-Snoring Device)',
 'Custom-engineered nighttime oral appliance that comfortably repositions the jaw to maintain open airways and reduce snoring.',
 30, NULL, 'SPECIALIZED', true, NULL),

('Botox for Gummy Smile',
 'Minimally invasive neuromodulator injections that gently relax hyperactive upper lip muscles for a balanced smile line.',
 30, NULL, 'SPECIALIZED', true, NULL),

-- Restorative Dentistry
('Dental Fillings',
 'Natural tooth-colored composite restorations to repair decay, fractures, and wear seamlessly.',
 30, NULL, 'GENERAL', true, NULL),

('Inlays and Onlays',
 'Custom-crafted laboratory restorations designed for moderate tooth damage, providing superior strength while preserving healthy enamel.',
 60, NULL, 'GENERAL', true, NULL),

-- Prosthodontics
('Crowns and Bridges',
 'Durable custom full-coverage restorations designed to cap damaged teeth or span gaps from missing teeth. Available in metal, porcelain, and zirconia.',
 90, NULL, 'GENERAL', true, NULL),

('Dentures (Full and Partial)',
 'Custom-crafted removable dental prosthetics to restore chewing function, speech clarity, and facial aesthetics. Options include precision attachments, flexible denture, Ivocap, and metal frameworks.',
 60, NULL, 'GENERAL', true, NULL)

ON CONFLICT DO NOTHING;

-- Re-map all active doctors to every new service
INSERT INTO public.doctor_services (doctor_id, service_id)
SELECT u.id, s.id
FROM public.users u
CROSS JOIN public.services s
WHERE u.role = 'DOCTOR'
  AND u.status IN ('ACTIVE', 'HIDDEN')
  AND s.is_active = true
ON CONFLICT (doctor_id, service_id) DO NOTHING;
