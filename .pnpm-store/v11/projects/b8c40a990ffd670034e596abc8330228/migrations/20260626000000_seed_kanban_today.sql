-- ============================================================
-- 🌱 Kanban Board Test Seed — Dynamic relative to now()
-- Covers all 5 kanban columns relative to current local execution time
-- Generates exactly 2 appointments per column (10 total)
-- ============================================================

DO $$
DECLARE
  v_patient_id  UUID;
  v_doc_a       UUID := 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5';
  v_doc_b       UUID := '5f89c670-8b1e-4505-8854-3e9a593e82d1';
  v_today       DATE := CURRENT_DATE;
BEGIN

  -- 1. Ensure Doctors exist in public.users
  INSERT INTO public.users (id, email, first_name, last_name, role, is_active)
  VALUES 
    (v_doc_a, 'doctor.a@example.com', 'Jane', 'Doe', 'DOCTOR'::public.user_role, true),
    (v_doc_b, 'doctor.b@example.com', 'John', 'Smith', 'DOCTOR'::public.user_role, true)
  ON CONFLICT (id) DO UPDATE SET role = 'DOCTOR'::public.user_role;

  -- 2. Find a valid patient user
  SELECT id INTO v_patient_id FROM public.users WHERE role = 'PATIENT' LIMIT 1;
  
  IF v_patient_id IS NULL THEN
    v_patient_id := 'ab000000-0000-4000-b000-000000000000'::uuid;
    INSERT INTO public.users (id, email, first_name, last_name, role, is_active)
    VALUES (v_patient_id, 'patient.test@example.com', 'Test', 'Patient', 'PATIENT'::public.user_role, true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ── Clean up previous test appointments ───────────────────
  DELETE FROM public.invoices WHERE appointment_id IN (
    'ab000000-0000-4000-a000-000000000001'::uuid,
    'ab000000-0000-4000-a000-000000000002'::uuid,
    'ab000000-0000-4000-a000-000000000003'::uuid,
    'ab000000-0000-4000-a000-000000000004'::uuid,
    'ab000000-0000-4000-a000-000000000005'::uuid,
    'ab000000-0000-4000-a000-000000000006'::uuid,
    'ab000000-0000-4000-a000-000000000007'::uuid,
    'ab000000-0000-4000-a000-000000000008'::uuid,
    'ab000000-0000-4000-a000-000000000009'::uuid,
    'ab000000-0000-4000-a000-000000000010'::uuid
  );

  DELETE FROM public.appointment_treatments WHERE appointment_id IN (
    'ab000000-0000-4000-a000-000000000001'::uuid,
    'ab000000-0000-4000-a000-000000000002'::uuid,
    'ab000000-0000-4000-a000-000000000003'::uuid,
    'ab000000-0000-4000-a000-000000000004'::uuid,
    'ab000000-0000-4000-a000-000000000005'::uuid,
    'ab000000-0000-4000-a000-000000000006'::uuid,
    'ab000000-0000-4000-a000-000000000007'::uuid,
    'ab000000-0000-4000-a000-000000000008'::uuid,
    'ab000000-0000-4000-a000-000000000009'::uuid,
    'ab000000-0000-4000-a000-000000000010'::uuid
  );

  DELETE FROM public.appointment_status_history WHERE appointment_id IN (
    'ab000000-0000-4000-a000-000000000001'::uuid,
    'ab000000-0000-4000-a000-000000000002'::uuid,
    'ab000000-0000-4000-a000-000000000003'::uuid,
    'ab000000-0000-4000-a000-000000000004'::uuid,
    'ab000000-0000-4000-a000-000000000005'::uuid,
    'ab000000-0000-4000-a000-000000000006'::uuid,
    'ab000000-0000-4000-a000-000000000007'::uuid,
    'ab000000-0000-4000-a000-000000000008'::uuid,
    'ab000000-0000-4000-a000-000000000009'::uuid,
    'ab000000-0000-4000-a000-000000000010'::uuid
  );

  DELETE FROM public.appointments WHERE id IN (
    'ab000000-0000-4000-a000-000000000001'::uuid,
    'ab000000-0000-4000-a000-000000000002'::uuid,
    'ab000000-0000-4000-a000-000000000003'::uuid,
    'ab000000-0000-4000-a000-000000000004'::uuid,
    'ab000000-0000-4000-a000-000000000005'::uuid,
    'ab000000-0000-4000-a000-000000000006'::uuid,
    'ab000000-0000-4000-a000-000000000007'::uuid,
    'ab000000-0000-4000-a000-000000000008'::uuid,
    'ab000000-0000-4000-a000-000000000009'::uuid,
    'ab000000-0000-4000-a000-000000000010'::uuid
  );

  -- Clean other appointments on same doctors for today
  DELETE FROM public.invoices WHERE appointment_id IN (
    SELECT id FROM public.appointments WHERE date = v_today AND doctor_id IN (v_doc_a, v_doc_b)
  );
  DELETE FROM public.appointment_treatments WHERE appointment_id IN (
    SELECT id FROM public.appointments WHERE date = v_today AND doctor_id IN (v_doc_a, v_doc_b)
  );
  DELETE FROM public.appointment_status_history WHERE appointment_id IN (
    SELECT id FROM public.appointments WHERE date = v_today AND doctor_id IN (v_doc_a, v_doc_b)
  );
  DELETE FROM public.appointments WHERE date = v_today AND doctor_id IN (v_doc_a, v_doc_b);

  -- ── Appointments ─────────────────────────────────────────
  INSERT INTO public.appointments (
    id, patient_id, dependent_id, service_id, doctor_id,
    date, start_time, end_time,
    status, source, doctor_assignment_source,
    user_note, status_reason,
    proposed_date, proposed_start_time, proposed_end_time, proposed_doctor_id,
    reschedule_count, created_at, updated_at
  ) VALUES

  -- ── Col 1a: APPROVED — Future Active Check-In Window (Dr. A, starts 1.0h from now)
  (
    'ab000000-0000-4000-a000-000000000001'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
    v_doc_a,
    v_today,
    timezone('UTC', timezone('Asia/Manila', now()) + interval '1 hour'),
    timezone('UTC', timezone('Asia/Manila', now()) + interval '1.5 hours'),
    'APPROVED'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'SYSTEM'::public.doctor_assignment_source,
    'Kanban test — Col 1 active window 1',
    'Confirmed.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 1b: APPROVED — Expired slot (Dr. A, starts 1.0h ago, ends 0.5h ago → No-Show button visible)
  (
    'ab000000-0000-4000-a000-000000000002'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
    v_doc_a,
    v_today,
    timezone('UTC', timezone('Asia/Manila', now()) - interval '1 hour'),
    timezone('UTC', timezone('Asia/Manila', now()) - interval '30 minutes'),
    'APPROVED'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'USER'::public.doctor_assignment_source,
    'Kanban test — Col 1 slot expired, No-Show button',
    'Confirmed.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 2a: NO_SHOW (Dr. A, starts 3 hours ago, ends 2.5 hours ago)
  (
    'ab000000-0000-4000-a000-000000000003'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
    v_doc_a,
    v_today,
    timezone('UTC', timezone('Asia/Manila', now()) - interval '3 hours'),
    timezone('UTC', timezone('Asia/Manila', now()) - interval '2.5 hours'),
    'NO_SHOW'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'SYSTEM'::public.doctor_assignment_source,
    'Kanban test — Col 2 no-show 1',
    'No-show recorded.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 2b: NO_SHOW (Dr. B, starts 3 hours ago, ends 2.5 hours ago)
  (
    'ab000000-0000-4000-a000-000000000007'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
    v_doc_b,
    v_today,
    timezone('UTC', timezone('Asia/Manila', now()) - interval '3 hours'),
    timezone('UTC', timezone('Asia/Manila', now()) - interval '2.5 hours'),
    'NO_SHOW'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'SYSTEM'::public.doctor_assignment_source,
    'Kanban test — Col 2 no-show 2',
    'No-show recorded.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 3a: CHECKED_IN (Dr. B, starts 30m ago, ends 30m from now)
  (
    'ab000000-0000-4000-a000-000000000004'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1),
    v_doc_b,
    v_today,
    timezone('UTC', timezone('Asia/Manila', now()) - interval '30 minutes'),
    timezone('UTC', timezone('Asia/Manila', now()) + interval '30 minutes'),
    'CHECKED_IN'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'USER'::public.doctor_assignment_source,
    'Kanban test — Col 3 checked in 1',
    'Patient checked in at reception.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 3b: CHECKED_IN (Dr. A, starts 30m ago, ends 30m from now)
  (
    'ab000000-0000-4000-a000-000000000008'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
    v_doc_a,
    v_today,
    timezone('UTC', timezone('Asia/Manila', now()) - interval '30 minutes'),
    timezone('UTC', timezone('Asia/Manila', now()) + interval '30 minutes'),
    'CHECKED_IN'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'SYSTEM'::public.doctor_assignment_source,
    'Kanban test — Col 3 checked in 2',
    'Patient checked in at reception.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 4a: TREATMENT_RENDERED (Dr. B, starts 2 hours ago, ends 1.5 hours ago)
  (
    'ab000000-0000-4000-a000-000000000005'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
    v_doc_b,
    v_today,
    timezone('UTC', timezone('Asia/Manila', now()) - interval '2 hours'),
    timezone('UTC', timezone('Asia/Manila', now()) - interval '1.5 hours'),
    'TREATMENT_RENDERED'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'SYSTEM'::public.doctor_assignment_source,
    'Kanban test — Col 4 ready for checkout 1',
    'Treatment submitted by doctor; draft invoice created.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 4b: TREATMENT_RENDERED (Dr. A, starts 2 hours ago, ends 1.5 hours ago)
  (
    'ab000000-0000-4000-a000-000000000009'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
    v_doc_a,
    v_today,
    timezone('UTC', timezone('Asia/Manila', now()) - interval '2 hours'),
    timezone('UTC', timezone('Asia/Manila', now()) - interval '1.5 hours'),
    'TREATMENT_RENDERED'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'SYSTEM'::public.doctor_assignment_source,
    'Kanban test — Col 4 ready for checkout 2',
    'Treatment submitted by doctor; draft invoice created.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 5a: COMPLETED (Dr. A, starts 4 hours ago, ends 3.5 hours ago)
  (
    'ab000000-0000-4000-a000-000000000006'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
    v_doc_a,
    v_today,
    timezone('UTC', timezone('Asia/Manila', now()) - interval '4 hours'),
    timezone('UTC', timezone('Asia/Manila', now()) - interval '3.5 hours'),
    'COMPLETED'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'USER'::public.doctor_assignment_source,
    'Kanban test — Col 5 completed 1',
    'Checkout complete, invoice paid.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 5b: COMPLETED (Dr. B, starts 4 hours ago, ends 3.5 hours ago)
  (
    'ab000000-0000-4000-a000-000000000010'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
    v_doc_b,
    v_today,
    timezone('UTC', timezone('Asia/Manila', now()) - interval '4 hours'),
    timezone('UTC', timezone('Asia/Manila', now()) - interval '3.5 hours'),
    'COMPLETED'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'USER'::public.doctor_assignment_source,
    'Kanban test — Col 5 completed 2',
    'Checkout complete, invoice paid.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  );

  -- ── Status History ────────────────────────────────────────
  INSERT INTO public.appointment_status_history (
    appointment_id, changed_by, actor_role,
    previous_status, new_status, reason, created_at
  ) VALUES
  ('ab000000-0000-4000-a000-000000000001'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '2 hours'),
  ('ab000000-0000-4000-a000-000000000001'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '1 hour'),

  ('ab000000-0000-4000-a000-000000000002'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '3 hours'),
  ('ab000000-0000-4000-a000-000000000002'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '2 hours'),

  ('ab000000-0000-4000-a000-000000000003'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '4 hours'),
  ('ab000000-0000-4000-a000-000000000003'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '3 hours'),
  ('ab000000-0000-4000-a000-000000000003'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'NO_SHOW'::public.appointment_status, 'No-show recorded.', now() - interval '1 hour'),

  ('ab000000-0000-4000-a000-000000000007'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '5 hours'),
  ('ab000000-0000-4000-a000-000000000007'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '4 hours'),
  ('ab000000-0000-4000-a000-000000000007'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'NO_SHOW'::public.appointment_status, 'No-show recorded.', now() - interval '2 hours'),

  ('ab000000-0000-4000-a000-000000000004'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '5 hours'),
  ('ab000000-0000-4000-a000-000000000004'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '4 hours'),
  ('ab000000-0000-4000-a000-000000000004'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'CHECKED_IN'::public.appointment_status, 'Patient checked in.', now() - interval '30 minutes'),

  ('ab000000-0000-4000-a000-000000000008'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '6 hours'),
  ('ab000000-0000-4000-a000-000000000008'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '5 hours'),
  ('ab000000-0000-4000-a000-000000000008'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'CHECKED_IN'::public.appointment_status, 'Patient checked in.', now() - interval '1 hour'),

  ('ab000000-0000-4000-a000-000000000005'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '6 hours'),
  ('ab000000-0000-4000-a000-000000000005'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '5 hours'),
  ('ab000000-0000-4000-a000-000000000005'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'CHECKED_IN'::public.appointment_status, 'Patient checked in.', now() - interval '2 hours'),
  ('ab000000-0000-4000-a000-000000000005'::uuid, v_doc_a, 'DOCTOR', 'CHECKED_IN'::public.appointment_status, 'TREATMENT_RENDERED'::public.appointment_status, 'Treatment done, draft invoice created.', now() - interval '30 minutes'),

  ('ab000000-0000-4000-a000-000000000009'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '7 hours'),
  ('ab000000-0000-4000-a000-000000000009'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '6 hours'),
  ('ab000000-0000-4000-a000-000000000009'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'CHECKED_IN'::public.appointment_status, 'Patient checked in.', now() - interval '3 hours'),
  ('ab000000-0000-4000-a000-000000000009'::uuid, v_doc_b, 'DOCTOR', 'CHECKED_IN'::public.appointment_status, 'TREATMENT_RENDERED'::public.appointment_status, 'Treatment done, draft invoice created.', now() - interval '1 hour'),

  ('ab000000-0000-4000-a000-000000000006'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '8 hours'),
  ('ab000000-0000-4000-a000-000000000006'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '7 hours'),
  ('ab000000-0000-4000-a000-000000000006'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'CHECKED_IN'::public.appointment_status, 'Patient checked in.', now() - interval '5 hours'),
  ('ab000000-0000-4000-a000-000000000006'::uuid, v_doc_b, 'DOCTOR', 'CHECKED_IN'::public.appointment_status, 'TREATMENT_RENDERED'::public.appointment_status, 'Treatment done.', now() - interval '3 hours'),
  ('ab000000-0000-4000-a000-000000000006'::uuid, NULL, 'SECRETARY', 'TREATMENT_RENDERED'::public.appointment_status, 'COMPLETED'::public.appointment_status, 'Checkout complete, invoice paid.', now() - interval '2 hours'),

  ('ab000000-0000-4000-a000-000000000010'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '9 hours'),
  ('ab000000-0000-4000-a000-000000000010'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '8 hours'),
  ('ab000000-0000-4000-a000-000000000010'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'CHECKED_IN'::public.appointment_status, 'Patient checked in.', now() - interval '6 hours'),
  ('ab000000-0000-4000-a000-000000000010'::uuid, v_doc_a, 'DOCTOR', 'CHECKED_IN'::public.appointment_status, 'TREATMENT_RENDERED'::public.appointment_status, 'Treatment done.', now() - interval '4 hours'),
  ('ab000000-0000-4000-a000-000000000010'::uuid, NULL, 'SECRETARY', 'TREATMENT_RENDERED'::public.appointment_status, 'COMPLETED'::public.appointment_status, 'Checkout complete, invoice paid.', now() - interval '3 hours');

  -- ── Appointment Treatments ────────────────────────────────
  INSERT INTO public.appointment_treatments (
    appointment_id, service_id, comment, created_at
  ) VALUES
  (
    'ab000000-0000-4000-a000-000000000005'::uuid,
    (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
    'Kanban test — scale and polish done.',
    now() - interval '30 minutes'
  ),
  (
    'ab000000-0000-4000-a000-000000000009'::uuid,
    (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
    'Kanban test — root canal treatment completed.',
    now() - interval '1 hour'
  ),
  (
    'ab000000-0000-4000-a000-000000000006'::uuid,
    (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
    'Kanban test — composite filling completed.',
    now() - interval '3 hours'
  ),
  (
    'ab000000-0000-4000-a000-000000000010'::uuid,
    (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
    'Kanban test — scale and polish completed.',
    now() - interval '4 hours'
  );

  -- ── Invoices ──────────────────────────────────────────────
  INSERT INTO public.invoices (
    appointment_id, amount, status, payment_method,
    discount_applied, created_at, updated_at
  ) VALUES
  (
    'ab000000-0000-4000-a000-000000000005'::uuid,
    1500.00,
    'DRAFT'::public.invoice_status,
    NULL,
    0.00,
    now() - interval '30 minutes',
    now() - interval '30 minutes'
  ),
  (
    'ab000000-0000-4000-a000-000000000009'::uuid,
    3500.00,
    'DRAFT'::public.invoice_status,
    NULL,
    0.00,
    now() - interval '1 hour',
    now() - interval '1 hour'
  ),
  (
    'ab000000-0000-4000-a000-000000000006'::uuid,
    2200.00,
    'FINALIZED'::public.invoice_status,
    'CASH'::public.payment_method,
    10.00,
    now() - interval '3 hours',
    now() - interval '2 hours'
  ),
  (
    'ab000000-0000-4000-a000-000000000010'::uuid,
    1500.00,
    'FINALIZED'::public.invoice_status,
    'CARD'::public.payment_method,
    0.00,
    now() - interval '4 hours',
    now() - interval '3 hours'
  );

END $$;
