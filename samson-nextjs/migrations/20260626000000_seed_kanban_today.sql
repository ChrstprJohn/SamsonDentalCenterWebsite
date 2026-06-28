-- ============================================================
-- Kanban Board Test Seed — Today: 2026-06-26
-- Covers all 5 kanban columns:
--   Col 1 APPROVED  → (09:00–09:30, window active ~08:30–09:30)
--   Col 1 APPROVED  → (07:00–07:30, slot past → No-Show button visible)
--   Col 2 NO_SHOW   
--   Col 3 CHECKED_IN
--   Col 4 TREATMENT_RENDERED → + DRAFT invoice
--   Col 5 COMPLETED → + FINALIZED invoice
--
-- Times stored as naive-UTC (09:00:00+00 = "9 AM clinic local").
-- Doctor UUIDs reused from existing seed:
--   d3b07384-d113-4ec2-a5e6-ec083b0f5cc5  (Dr. A)
--   5f89c670-8b1e-4505-8854-3e9a593e82d1  (Dr. B)
-- Patient: Dynamically resolved from auth.users (first registered user,
--   falling back to a generic user if none exist).
-- ============================================================

DO $$
DECLARE
  v_patient_id UUID;
  v_doc_a      UUID := 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5';
  v_doc_b      UUID := '5f89c670-8b1e-4505-8854-3e9a593e82d1';
BEGIN

  -- 1. Find a valid patient user from public.users to bind to appointments
  SELECT id INTO v_patient_id FROM public.users LIMIT 1;
  
  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'No users found in public.users. Please run the main seed migration first.';
  END IF;

  -- ── Clean up previous kanban test rows ───────────────────
  DELETE FROM public.invoices WHERE appointment_id IN (
    'ab000000-0000-4000-a000-000000000001'::uuid,
    'ab000000-0000-4000-a000-000000000002'::uuid,
    'ab000000-0000-4000-a000-000000000003'::uuid,
    'ab000000-0000-4000-a000-000000000004'::uuid,
    'ab000000-0000-4000-a000-000000000005'::uuid,
    'ab000000-0000-4000-a000-000000000006'::uuid
  );

  DELETE FROM public.appointment_treatments WHERE appointment_id IN (
    'ab000000-0000-4000-a000-000000000001'::uuid,
    'ab000000-0000-4000-a000-000000000002'::uuid,
    'ab000000-0000-4000-a000-000000000003'::uuid,
    'ab000000-0000-4000-a000-000000000004'::uuid,
    'ab000000-0000-4000-a000-000000000005'::uuid,
    'ab000000-0000-4000-a000-000000000006'::uuid
  );

  DELETE FROM public.appointment_status_history WHERE appointment_id IN (
    'ab000000-0000-4000-a000-000000000001'::uuid,
    'ab000000-0000-4000-a000-000000000002'::uuid,
    'ab000000-0000-4000-a000-000000000003'::uuid,
    'ab000000-0000-4000-a000-000000000004'::uuid,
    'ab000000-0000-4000-a000-000000000005'::uuid,
    'ab000000-0000-4000-a000-000000000006'::uuid
  );

  DELETE FROM public.appointments WHERE id IN (
    'ab000000-0000-4000-a000-000000000001'::uuid,
    'ab000000-0000-4000-a000-000000000002'::uuid,
    'ab000000-0000-4000-a000-000000000003'::uuid,
    'ab000000-0000-4000-a000-000000000004'::uuid,
    'ab000000-0000-4000-a000-000000000005'::uuid,
    'ab000000-0000-4000-a000-000000000006'::uuid
  );

  -- ── Clean up ANY other appointments for these doctors on today's date to avoid constraint violation ──
  DELETE FROM public.invoices WHERE appointment_id IN (
    SELECT id FROM public.appointments WHERE date = '2026-06-26' AND doctor_id IN (v_doc_a, v_doc_b)
  );
  DELETE FROM public.appointment_treatments WHERE appointment_id IN (
    SELECT id FROM public.appointments WHERE date = '2026-06-26' AND doctor_id IN (v_doc_a, v_doc_b)
  );
  DELETE FROM public.appointment_status_history WHERE appointment_id IN (
    SELECT id FROM public.appointments WHERE date = '2026-06-26' AND doctor_id IN (v_doc_a, v_doc_b)
  );
  DELETE FROM public.appointments WHERE date = '2026-06-26' AND doctor_id IN (v_doc_a, v_doc_b);

  -- ── Appointments ─────────────────────────────────────────
  INSERT INTO public.appointments (
    id, patient_id, dependent_id, service_id, doctor_id,
    date, start_time, end_time,
    status, source, doctor_assignment_source,
    user_note, status_reason,
    proposed_date, proposed_start_time, proposed_end_time, proposed_doctor_id,
    reschedule_count, created_at, updated_at
  ) VALUES

  -- ── Col 1a: APPROVED — slot 09:00–09:30 (window 08:30–09:30 clinic local)
  (
    'ab000000-0000-4000-a000-000000000001'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
    v_doc_b,
    '2026-06-26',
    '2026-06-26 09:00:00+00',
    '2026-06-26 09:30:00+00',
    'APPROVED'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'SYSTEM'::public.doctor_assignment_source,
    'Kanban test — Col 1 active window',
    'Confirmed.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 1b: APPROVED — slot 07:00–07:30 (past end → No-Show button visible now)
  (
    'ab000000-0000-4000-a000-000000000002'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
    v_doc_a,
    '2026-06-26',
    '2026-06-26 07:00:00+00',
    '2026-06-26 07:30:00+00',
    'APPROVED'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'USER'::public.doctor_assignment_source,
    'Kanban test — Col 1 slot expired, No-Show button',
    'Confirmed.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 2: NO_SHOW
  (
    'ab000000-0000-4000-a000-000000000003'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
    v_doc_a,
    '2026-06-26',
    '2026-06-26 08:00:00+00',
    '2026-06-26 09:00:00+00',
    'NO_SHOW'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'SYSTEM'::public.doctor_assignment_source,
    'Kanban test — Col 2 no-show',
    'No-show recorded.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 3: CHECKED_IN
  (
    'ab000000-0000-4000-a000-000000000004'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1),
    v_doc_b,
    '2026-06-26',
    '2026-06-26 10:00:00+00',
    '2026-06-26 10:30:00+00',
    'CHECKED_IN'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'USER'::public.doctor_assignment_source,
    'Kanban test — Col 3 checked in',
    'Patient checked in at reception.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 4: TREATMENT_RENDERED (needs DRAFT invoice below)
  (
    'ab000000-0000-4000-a000-000000000005'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
    v_doc_a,
    '2026-06-26',
    '2026-06-26 11:00:00+00',
    '2026-06-26 11:30:00+00',
    'TREATMENT_RENDERED'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'SYSTEM'::public.doctor_assignment_source,
    'Kanban test — Col 4 ready for checkout',
    'Treatment submitted by doctor; draft invoice created.',
    NULL, NULL, NULL, NULL,
    0,
    now(), now()
  ),

  -- ── Col 5: COMPLETED (needs FINALIZED invoice below)
  (
    'ab000000-0000-4000-a000-000000000006'::uuid,
    v_patient_id, NULL,
    (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
    v_doc_b,
    '2026-06-26',
    '2026-06-26 12:00:00+00',
    '2026-06-26 12:30:00+00',
    'COMPLETED'::public.appointment_status,
    'SELF_BOOKED'::public.appointment_source,
    'USER'::public.doctor_assignment_source,
    'Kanban test — Col 5 completed',
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
  -- kb-001 APPROVED
  ('ab000000-0000-4000-a000-000000000001'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '2 hours'),
  ('ab000000-0000-4000-a000-000000000001'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '1 hour'),
  -- kb-002 APPROVED (slot expired)
  ('ab000000-0000-4000-a000-000000000002'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '3 hours'),
  ('ab000000-0000-4000-a000-000000000002'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '2 hours'),
  -- kb-003 NO_SHOW
  ('ab000000-0000-4000-a000-000000000003'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '4 hours'),
  ('ab000000-0000-4000-a000-000000000003'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '3 hours'),
  ('ab000000-0000-4000-a000-000000000003'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'NO_SHOW'::public.appointment_status, 'No-show recorded.', now() - interval '1 hour'),
  -- kb-004 CHECKED_IN
  ('ab000000-0000-4000-a000-000000000004'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '5 hours'),
  ('ab000000-0000-4000-a000-000000000004'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '4 hours'),
  ('ab000000-0000-4000-a000-000000000004'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'CHECKED_IN'::public.appointment_status, 'Patient checked in.', now() - interval '30 minutes'),
  -- kb-005 TREATMENT_RENDERED
  ('ab000000-0000-4000-a000-000000000005'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '6 hours'),
  ('ab000000-0000-4000-a000-000000000005'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '5 hours'),
  ('ab000000-0000-4000-a000-000000000005'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'CHECKED_IN'::public.appointment_status, 'Patient checked in.', now() - interval '2 hours'),
  ('ab000000-0000-4000-a000-000000000005'::uuid, v_doc_a, 'DOCTOR', 'CHECKED_IN'::public.appointment_status, 'TREATMENT_RENDERED'::public.appointment_status, 'Treatment done, draft invoice created.', now() - interval '30 minutes'),
  -- kb-006 COMPLETED
  ('ab000000-0000-4000-a000-000000000006'::uuid, v_patient_id, 'PATIENT', NULL, 'PENDING'::public.appointment_status, 'Booking submitted', now() - interval '8 hours'),
  ('ab000000-0000-4000-a000-000000000006'::uuid, NULL, 'SECRETARY', 'PENDING'::public.appointment_status, 'APPROVED'::public.appointment_status, 'Confirmed.', now() - interval '7 hours'),
  ('ab000000-0000-4000-a000-000000000006'::uuid, NULL, 'SECRETARY', 'APPROVED'::public.appointment_status, 'CHECKED_IN'::public.appointment_status, 'Patient checked in.', now() - interval '5 hours'),
  ('ab000000-0000-4000-a000-000000000006'::uuid, v_doc_b, 'DOCTOR', 'CHECKED_IN'::public.appointment_status, 'TREATMENT_RENDERED'::public.appointment_status, 'Treatment done.', now() - interval '3 hours'),
  ('ab000000-0000-4000-a000-000000000006'::uuid, NULL, 'SECRETARY', 'TREATMENT_RENDERED'::public.appointment_status, 'COMPLETED'::public.appointment_status, 'Checkout complete, invoice paid.', now() - interval '2 hours');

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
    'ab000000-0000-4000-a000-000000000006'::uuid,
    (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
    'Kanban test — composite filling completed.',
    now() - interval '3 hours'
  );

  -- ── Invoices ──────────────────────────────────────────────
  INSERT INTO public.invoices (
    appointment_id, amount, status, payment_method,
    discount_applied, created_at, updated_at
  ) VALUES
  -- Col 4: DRAFT — appears in checkout modal
  (
    'ab000000-0000-4000-a000-000000000005'::uuid,
    1500.00,
    'DRAFT'::public.invoice_status,
    NULL,
    0.00,
    now() - interval '30 minutes',
    now() - interval '30 minutes'
  ),
  -- Col 5: FINALIZED — viewable in completed modal
  (
    'ab000000-0000-4000-a000-000000000006'::uuid,
    2200.00,
    'FINALIZED'::public.invoice_status,
    'CASH'::public.payment_method,
    10.00,
    now() - interval '3 hours',
    now() - interval '2 hours'
  );

END $$;
