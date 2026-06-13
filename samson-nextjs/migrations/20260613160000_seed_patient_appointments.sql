-- Migration to seed patient account, dependent, and sample appointments with various statuses.

-- 1. Create auth.users record for the patient (with bcrypt hash for 'password123')
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
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  '00000000-0000-0000-0000-000000000000',
  'christopher.picardo@example.com',
  '$2a$10$tZ91176zZ/oB8.pC0mYwRe8m9U15L/d1k76W.W8Z7J9d6g/8g1O6a', -- password123
  now(),
  '{"firstName": "Christopher", "lastName": "Picardo"}'::jsonb,
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

-- 2. Update the public.users record for reliability metrics (created automatically by trigger)
UPDATE public.users 
SET 
  cancel_count = 3,
  no_show_count = 1,
  reschedule_count = 1
WHERE id = '0e70c53d-8ab1-420a-8de0-bf7f09320e8b';

-- 3. Seed a dependent for the patient
INSERT INTO public.dependents (
  id,
  patient_id,
  first_name,
  last_name,
  date_of_birth,
  relationship
)
VALUES (
  '1a39f68e-9d2c-47bb-a98e-4a6c65b532e8',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  'Julian',
  'Picardo',
  '2010-05-15',
  'SIBLING'::public.dependent_relationship
)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed sample appointments mapping to the mock appointments statuses
-- Doctor IDs:
-- Dr. Jane Doe: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5'
-- Dr. John Smith: '5f89c670-8b1e-4505-8854-3e9a593e82d1'

INSERT INTO public.appointments (
  id,
  patient_id,
  dependent_id,
  service_id,
  doctor_id,
  date,
  start_time,
  end_time,
  status,
  user_note,
  status_reason,
  proposed_date,
  proposed_start_time,
  proposed_end_time,
  proposed_doctor_id,
  reschedule_count
) VALUES
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  NULL,
  (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1),
  'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
  '2026-06-24',
  '2026-06-24 10:00:00+00',
  '2026-06-24 10:30:00+00',
  'APPROVED'::public.appointment_status,
  'Orthodontic checkup',
  'Confirmed slot availability.',
  NULL, NULL, NULL, NULL,
  0
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cc2',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  '1a39f68e-9d2c-47bb-a98e-4a6c65b532e8', -- Dependent: Julian Picardo
  (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
  '5f89c670-8b1e-4505-8854-3e9a593e82d1',
  '2026-06-28',
  '2026-06-28 14:00:00+00',
  '2026-06-28 14:30:00+00',
  'RESCHEDULE_REQUESTED'::public.appointment_status,
  'Routine cleaning for my brother',
  'Patient requested reschedule: change of work hours.',
  '2026-07-05',
  '2026-07-05 09:00:00+00',
  '2026-07-05 09:30:00+00',
  '5f89c670-8b1e-4505-8854-3e9a593e82d1',
  1
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cc3',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  NULL,
  (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
  'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
  '2026-06-20',
  '2026-06-20 11:00:00+00',
  '2026-06-20 12:00:00+00',
  'CHECKED_IN'::public.appointment_status,
  'Severe tooth pain',
  'Patient checked-in at reception.',
  NULL, NULL, NULL, NULL,
  0
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cc4',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  NULL,
  (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
  '5f89c670-8b1e-4505-8854-3e9a593e82d1',
  '2026-06-30',
  '2026-06-30 09:00:00+00',
  '2026-06-30 09:30:00+00',
  'PENDING'::public.appointment_status,
  'New whitening treatment request',
  NULL,
  NULL, NULL, NULL, NULL,
  0
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  NULL,
  (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
  '5f89c670-8b1e-4505-8854-3e9a593e82d1',
  '2026-06-05',
  '2026-06-05 15:00:00+00',
  '2026-06-05 15:30:00+00',
  'COMPLETED'::public.appointment_status,
  'General scaling',
  'Checkout complete, invoice paid.',
  NULL, NULL, NULL, NULL,
  0
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  NULL,
  (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1),
  'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
  '2026-06-01',
  '2026-06-01 10:00:00+00',
  '2026-06-01 10:30:00+00',
  'CANCELLED'::public.appointment_status,
  'Initial alignment check',
  'Cancelled by user: Family emergency.',
  NULL, NULL, NULL, NULL,
  0
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cc7',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  '1a39f68e-9d2c-47bb-a98e-4a6c65b532e8', -- Dependent: Julian Picardo
  (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
  'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
  '2026-05-25',
  '2026-05-25 13:00:00+00',
  '2026-05-25 14:00:00+00',
  'REJECTED'::public.appointment_status,
  'Emergency checkup',
  'Rejected by staff: Roster conflict / doctor unavailable.',
  NULL, NULL, NULL, NULL,
  0
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cc8',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  NULL,
  (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
  '5f89c670-8b1e-4505-8854-3e9a593e82d1',
  '2026-05-20',
  '2026-05-20 09:00:00+00',
  '2026-05-20 09:30:00+00',
  'DISPLACED'::public.appointment_status,
  'Teeth whitening',
  'Displaced: Clinic closed on holiday schedule.',
  NULL, NULL, NULL, NULL,
  0
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cc9',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  NULL,
  (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
  '5f89c670-8b1e-4505-8854-3e9a593e82d1',
  '2026-05-15',
  '2026-05-15 10:00:00+00',
  '2026-05-15 10:30:00+00',
  'NO_SHOW'::public.appointment_status,
  'Routine scaling',
  'No-show recorded: Patient failed to attend.',
  NULL, NULL, NULL, NULL,
  0
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  NULL,
  (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1),
  'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
  '2026-06-12',
  '2026-06-12 16:00:00+00',
  '2026-06-12 16:30:00+00',
  'TREATMENT_RENDERED'::public.appointment_status,
  'Braces adjust',
  'Treatment submitted by doctor; draft invoice created.',
  NULL, NULL, NULL, NULL,
  0
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cd1',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  NULL,
  (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
  'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
  '2026-07-15',
  '2026-07-15 09:00:00+00',
  '2026-07-15 10:00:00+00',
  'APPROVED'::public.appointment_status,
  'Follow-up root canal',
  'Previously requested reschedule was rejected due to full schedule.',
  '2026-07-20',
  '2026-07-20 10:00:00+00',
  '2026-07-20 11:00:00+00',
  'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
  1
),
(
  'b3b07384-d113-4ec2-a5e6-ec083b0f5cd2',
  '0e70c53d-8ab1-420a-8de0-bf7f09320e8b',
  NULL,
  (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
  '5f89c670-8b1e-4505-8854-3e9a593e82d1',
  '2026-08-01',
  '2026-08-01 14:00:00+00',
  '2026-08-01 14:30:00+00',
  'APPROVED'::public.appointment_status,
  'Routine checkup (moved)',
  'Your reschedule request was approved by the staff. Your appointment has been successfully moved to this new date.',
  '2026-07-25',
  '2026-07-25 14:00:00+00',
  '2026-07-25 14:30:00+00',
  '5f89c670-8b1e-4505-8854-3e9a593e82d1',
  1
)
ON CONFLICT (id) DO NOTHING;
