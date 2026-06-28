-- ============================================================================
-- 🌱 Samson Dental - Seed Data (Run after schema.sql)
-- ============================================================================

-- 1. Insert Initial Services
INSERT INTO services (name, description, duration_minutes, price, service_type, is_active) VALUES
('Oral Prophylaxis (Teeth Cleaning)', 'Routine deep dental cleaning and scale removal.', 30, 1500.00, 'GENERAL', true),
('Tooth Extraction', 'Safe and professional tooth removal.', 45, 2000.00, 'GENERAL', true),
('Root Canal Therapy', 'Endodontic treatment for severely decayed or infected teeth.', 60, 8000.00, 'SPECIALIZED', true),
('Orthodontic Consultation', 'Assessment for braces, aligners, and dental realignment.', 30, 500.00, 'SPECIALIZED', true),
('Composite Filling', 'Restoration of tooth decay with natural composite materials.', 30, 1200.00, 'GENERAL', true)
ON CONFLICT DO NOTHING;

-- 2. Update pre-existing Admin and Secretary Accounts metadata and roles
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"ADMIN"'),
        '{firstName}', '"System"'
      ),
      '{lastName}', '"Admin"'
    )
WHERE email = 'admin@example.com';

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"SECRETARY"'),
        '{firstName}', '"Clinic"'
      ),
      '{lastName}', '"Secretary"'
    )
WHERE email = 'secretary@example.com';

UPDATE public.users 
SET role = 'ADMIN'::public.user_role
WHERE email = 'admin@example.com';

UPDATE public.users 
SET role = 'SECRETARY'::public.user_role
WHERE email = 'secretary@example.com';

-- 3. Seed Clinic Config Settings
INSERT INTO clinic_config (clinic_name, address, email, phone, operating_hours, is_booking_open, max_reschedules, allow_same_day_booking, calendar_render_days, social_links)
VALUES (
    'Samson Dental Center',
    '123 Dental Suite, Medical Plaza, Metro Manila',
    'contact@samsondental.com',
    '+63 917 123 4567',
    '{
        "monday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
        "tuesday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
        "wednesday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
        "thursday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
        "friday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
        "saturday": {"isOpen": true, "openTime": "09:00", "closeTime": "15:00"},
        "sunday": {"isOpen": false, "openTime": null, "closeTime": null}
    }'::jsonb,
    true,
    1,
    false,
    30,
    '[
        {"platform": "Facebook", "url": "https://facebook.com/samsondental"},
        {"platform": "Instagram", "url": "https://instagram.com/samsondental"}
    ]'::jsonb
)
ON CONFLICT (is_singleton) DO NOTHING;
