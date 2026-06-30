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

-- 4. Seed Failed Outbox Event for Secretary Portal Testing
DO $$
DECLARE
  v_patient_id UUID;
  v_service_id UUID;
  v_doctor_id UUID := 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5';
BEGIN
  -- Ensure Doctor exists
  INSERT INTO public.users (id, email, first_name, last_name, role, is_active)
  VALUES (v_doctor_id, 'doctor.a@example.com', 'Jane', 'Doe', 'DOCTOR'::public.user_role, true)
  ON CONFLICT (id) DO NOTHING;

  -- Get or create Patient
  SELECT id INTO v_patient_id FROM public.users WHERE email = 'picardochristopherjohnoleo1@gmail.com' LIMIT 1;
  IF v_patient_id IS NULL THEN
    v_patient_id := gen_random_uuid();
    INSERT INTO public.users (id, email, first_name, last_name, role, is_active)
    VALUES (v_patient_id, 'picardochristopherjohnoleo1@gmail.com', 'Christopher', 'Picardo', 'PATIENT'::public.user_role, true);
  END IF;

  -- Get Service
  SELECT id INTO v_service_id FROM public.services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1;

  -- Insert Failed Outbox Event with valid payload layout
  INSERT INTO outbox (event_type, payload, status, error_logs, retry_count)
  VALUES (
    'APPOINTMENT_BOOKED',
    jsonb_build_object(
      'appointmentId', gen_random_uuid(),
      'patientId', v_patient_id,
      'serviceId', v_service_id,
      'doctorId', v_doctor_id,
      'date', CURRENT_DATE::text,
      'startTime', (CURRENT_TIMESTAMP + interval '1 hour')::text,
      'durationMinutes', 30
    ),
    'FAILED',
    'Failed to send email: API rate limit exceeded.',
    3
  );
END $$;

