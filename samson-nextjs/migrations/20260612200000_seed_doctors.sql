-- Migration to seed doctor accounts, services, and schedules
-- 1. Create auth.users records for doctors (with placeholder passwords)
INSERT INTO auth.users (
  id, 
  instance_id,
  email, 
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data, 
  raw_app_meta_data, 
  aud, 
  role, 
  created_at, 
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES 
(
  'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
  '00000000-0000-0000-0000-000000000000',
  'jane.doe@samsondental.com',
  '$2a$10$tZ91176zZ/oB8.pC0mYwRe8m9U15L/d1k76W.W8Z7J9d6g/8g1O6a', -- bcrypt hash for 'password123'
  now(),
  '{"firstName": "Jane", "lastName": "Doe"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  '',
  '',
  ''
),
(
  '5f89c670-8b1e-4505-8854-3e9a593e82d1',
  '00000000-0000-0000-0000-000000000000',
  'john.smith@samsondental.com',
  '$2a$10$tZ91176zZ/oB8.pC0mYwRe8m9U15L/d1k76W.W8Z7J9d6g/8g1O6a', -- bcrypt hash for 'password123'
  now(),
  '{"firstName": "John", "lastName": "Smith"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- 2. Update their roles in public.users to DOCTOR
UPDATE public.users 
SET role = 'DOCTOR'::public.user_role
WHERE id IN ('d3b07384-d113-4ec2-a5e6-ec083b0f5cc5', '5f89c670-8b1e-4505-8854-3e9a593e82d1');

-- 3. Link Doctors to Services (using subqueries to fetch service IDs based on unique names)
INSERT INTO doctor_services (doctor_id, service_id)
VALUES
  ('d3b07384-d113-4ec2-a5e6-ec083b0f5cc5', (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1)),
  ('d3b07384-d113-4ec2-a5e6-ec083b0f5cc5', (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1)),
  ('5f89c670-8b1e-4505-8854-3e9a593e82d1', (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1)),
  ('5f89c670-8b1e-4505-8854-3e9a593e82d1', (SELECT id FROM services WHERE name = 'Tooth Extraction' LIMIT 1)),
  ('5f89c670-8b1e-4505-8854-3e9a593e82d1', (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1))
ON CONFLICT DO NOTHING;

-- 4. Define Schedules (day_of_week: 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat)
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time)
VALUES
  -- Dr. Jane Doe (Mon, Tue, Wed)
  ('d3b07384-d113-4ec2-a5e6-ec083b0f5cc5', 1, '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
  ('d3b07384-d113-4ec2-a5e6-ec083b0f5cc5', 2, '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
  ('d3b07384-d113-4ec2-a5e6-ec083b0f5cc5', 3, '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
  -- Dr. John Smith (Thu, Fri, Sat)
  ('5f89c670-8b1e-4505-8854-3e9a593e82d1', 4, '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
  ('5f89c670-8b1e-4505-8854-3e9a593e82d1', 5, '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
  ('5f89c670-8b1e-4505-8854-3e9a593e82d1', 6, '09:00:00', '17:00:00', '12:00:00', '13:00:00')
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;
