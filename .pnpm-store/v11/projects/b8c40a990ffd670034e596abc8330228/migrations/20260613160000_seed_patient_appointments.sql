  -- Migration to seed patient account, dependent, and sample appointments with various statuses.

  DO $$
  DECLARE
    v_patient_id UUID;
    v_dependent_id UUID := '1a39f68e-9d2c-47bb-a98e-4a6c65b532e8';
  BEGIN
    -- 1. Check if the user already exists in auth.users
    SELECT id INTO v_patient_id FROM auth.users WHERE email = 'picardochristopherjohnoleo1@gmail.com';
    
    -- If not, create them
    IF v_patient_id IS NULL THEN
      v_patient_id := '0e70c53d-8ab1-420a-8de0-bf7f09320e8b';
      
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
        v_patient_id,
        '00000000-0000-0000-0000-000000000000',
        'picardochristopherjohnoleo1@gmail.com',
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
      );
    END IF;

    -- 2. Update their reliability counts in public.users
    UPDATE public.users 
    SET 
      cancel_count = 3,
      no_show_count = 1,
      reschedule_count = 1
    WHERE id = v_patient_id;

    -- 3. Seed the dependent
    INSERT INTO public.dependents (
      id,
      patient_id,
      first_name,
      last_name,
      date_of_birth,
      relationship
    )
    VALUES (
      v_dependent_id,
      v_patient_id,
      'Julian',
      'Picardo',
      '2010-05-15',
      'SIBLING'::public.dependent_relationship
    )
    ON CONFLICT (id) DO NOTHING;

    -- 4. Clean up existing records for the sample appointments to allow clean re-runs
    DELETE FROM public.invoices WHERE appointment_id IN (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc2',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc3', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc4',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc7', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc8',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc9', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd1', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cd2'
    );
    
    DELETE FROM public.appointment_treatments WHERE appointment_id IN (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc2',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc3', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc4',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc7', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc8',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc9', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd1', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cd2'
    );

    DELETE FROM public.appointment_status_history WHERE appointment_id IN (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc2',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc3', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc4',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc7', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc8',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc9', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd1', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cd2',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5ce1', 'b3b07384-d113-4ec2-a5e6-ec083b0f5ce2', 'b3b07384-d113-4ec2-a5e6-ec083b0f5ce3'
    );

    DELETE FROM public.appointments WHERE id IN (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc2',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc3', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc4',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc7', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc8',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc9', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd1', 'b3b07384-d113-4ec2-a5e6-ec083b0f5cd2',
      'b3b07384-d113-4ec2-a5e6-ec083b0f5ce1', 'b3b07384-d113-4ec2-a5e6-ec083b0f5ce2', 'b3b07384-d113-4ec2-a5e6-ec083b0f5ce3'
    );


    -- 5. Seed sample appointments (preserves IDs for code compatibility)
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
      source,
      doctor_assignment_source,
      user_note,
      status_reason,
      proposed_date,
      proposed_start_time,
      proposed_end_time,
      proposed_doctor_id,
      reschedule_count,
      created_at,
      updated_at
    ) VALUES
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1),
      'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      '2026-06-24',
      '2026-06-24 10:00:00+00',
      '2026-06-24 10:30:00+00',
      'APPROVED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'USER'::public.doctor_assignment_source,
      'Orthodontic checkup',
      'Confirmed slot availability.',
      NULL, NULL, NULL, NULL,
      0,
      '2026-06-14 09:00:00+00',
      '2026-06-14 14:30:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc2',
      v_patient_id,
      v_dependent_id,
      (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      '2026-06-28',
      '2026-06-28 14:00:00+00',
      '2026-06-28 14:30:00+00',
      'RESCHEDULE_REQUESTED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'Routine cleaning for my brother',
      'Patient requested reschedule: change of work hours.',
      '2026-07-05',
      '2026-07-05 09:00:00+00',
      '2026-07-05 09:30:00+00',
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      1,
      '2026-06-12 10:00:00+00',
      '2026-06-15 08:30:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc3',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
      'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      '2026-06-20',
      '2026-06-20 11:00:00+00',
      '2026-06-20 12:00:00+00',
      'CHECKED_IN'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'USER'::public.doctor_assignment_source,
      'Severe tooth pain',
      'Patient checked-in at reception.',
      NULL, NULL, NULL, NULL,
      0,
      '2026-06-10 09:00:00+00',
      '2026-06-20 10:45:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc4',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      '2026-06-30',
      '2026-06-30 09:00:00+00',
      '2026-06-30 09:30:00+00',
      'PENDING'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'New whitening treatment request',
      NULL,
      NULL, NULL, NULL, NULL,
      0,
      '2026-06-15 06:00:00+00',
      '2026-06-15 06:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      '2026-06-05',
      '2026-06-05 15:00:00+00',
      '2026-06-05 15:30:00+00',
      'COMPLETED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'General scaling',
      'Checkout complete, invoice paid.',
      NULL, NULL, NULL, NULL,
      0,
      '2026-06-01 09:00:00+00',
      '2026-06-05 15:40:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1),
      'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      '2026-06-01',
      '2026-06-01 10:00:00+00',
      '2026-06-01 10:30:00+00',
      'CANCELLED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'Initial alignment check',
      'Cancelled by user: Family emergency.',
      NULL, NULL, NULL, NULL,
      0,
      '2026-05-28 09:00:00+00',
      '2026-05-30 14:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc7',
      v_patient_id,
      v_dependent_id,
      (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
      'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      '2026-05-25',
      '2026-05-25 13:00:00+00',
      '2026-05-25 14:00:00+00',
      'REJECTED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'Emergency checkup',
      'Rejected by staff: Roster conflict / doctor unavailable.',
      NULL, NULL, NULL, NULL,
      0,
      '2026-05-20 10:00:00+00',
      '2026-05-20 15:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc8',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      '2026-05-20',
      '2026-05-20 09:00:00+00',
      '2026-05-20 09:30:00+00',
      'DISPLACED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'Teeth whitening',
      'Displaced: Clinic closed on holiday schedule.',
      NULL, NULL, NULL, NULL,
      0,
      '2026-05-10 09:00:00+00',
      '2026-05-18 08:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc9',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      '2026-05-15',
      '2026-05-15 10:00:00+00',
      '2026-05-15 10:30:00+00',
      'NO_SHOW'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'Routine scaling',
      'No-show recorded: Patient failed to attend.',
      NULL, NULL, NULL, NULL,
      0,
      '2026-05-10 09:00:00+00',
      '2026-05-15 11:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1),
      'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      '2026-06-12',
      '2026-06-12 16:00:00+00',
      '2026-06-12 16:30:00+00',
      'TREATMENT_RENDERED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'Braces adjust',
      'Treatment submitted by doctor; draft invoice created.',
      NULL, NULL, NULL, NULL,
      0,
      '2026-06-08 09:00:00+00',
      '2026-06-12 16:30:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd1',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Root Canal Therapy' LIMIT 1),
      'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      '2026-07-15',
      '2026-07-15 09:00:00+00',
      '2026-07-15 10:00:00+00',
      'APPROVED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'Follow-up root canal',
      'Previously requested reschedule was rejected due to full schedule.',
      NULL, NULL, NULL, NULL,
      1,
      '2026-06-10 09:00:00+00',
      '2026-06-13 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd2',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      '2026-07-25',
      '2026-07-25 14:00:00+00',
      '2026-07-25 14:30:00+00',
      'APPROVED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'USER'::public.doctor_assignment_source,
      'Routine checkup (moved)',
      'Your reschedule request was approved by the staff. Your appointment has been successfully moved to this new date.',
      NULL, NULL, NULL, NULL,
      1,
      '2026-06-10 09:00:00+00',
      '2026-06-13 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5ce1',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      '2026-06-30',
      '2026-06-30 08:00:00+00',
      '2026-06-30 08:30:00+00',
      'APPROVED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'USER'::public.doctor_assignment_source,
      'Cleaning booked beforehand',
      'Approved.',
      NULL, NULL, NULL, NULL,
      0,
      '2026-06-20 09:00:00+00',
      '2026-06-20 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5ce2',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Composite Filling' LIMIT 1),
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      '2026-06-30',
      '2026-06-30 09:30:00+00',
      '2026-06-30 10:00:00+00',
      'APPROVED'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'Urgent cavity fill request',
      'Approved.',
      NULL, NULL, NULL, NULL,
      0,
      '2026-06-20 09:00:00+00',
      '2026-06-20 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5ce3',
      v_patient_id,
      NULL,
      (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1),
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      '2026-06-30',
      '2026-06-30 10:30:00+00',
      '2026-06-30 11:00:00+00',
      'PENDING'::public.appointment_status,
      'SELF_BOOKED'::public.appointment_source,
      'SYSTEM'::public.doctor_assignment_source,
      'Orthodontic braces review request',
      NULL,
      NULL, NULL, NULL, NULL,
      0,
      '2026-06-21 09:00:00+00',
      '2026-06-21 09:00:00+00'
    );

    -- 6. Seed Status History Ledger for Audit Timelines
    INSERT INTO public.appointment_status_history (
      appointment_id,
      changed_by,
      actor_role,
      previous_status,
      new_status,
      reason,
      created_at
    ) VALUES
    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cc1 (APPROVED)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-06-14 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Confirmed slot availability.',
      '2026-06-14 14:30:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cc2 (RESCHEDULE_REQUESTED)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc2',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-06-12 10:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc2',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Confirmed slot availability.',
      '2026-06-12 11:15:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc2',
      v_patient_id,
      'PATIENT',
      'APPROVED'::public.appointment_status,
      'RESCHEDULE_REQUESTED'::public.appointment_status,
      'Patient requested reschedule: change of work hours.',
      '2026-06-15 08:30:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cc3 (CHECKED_IN)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc3',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-06-10 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc3',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Approved by staff.',
      '2026-06-10 13:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc3',
      NULL,
      'SECRETARY',
      'APPROVED'::public.appointment_status,
      'CHECKED_IN'::public.appointment_status,
      'Patient checked-in at reception.',
      '2026-06-20 10:45:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cc4 (PENDING)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc4',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-06-15 06:00:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cc5 (COMPLETED)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-06-01 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Approved by staff.',
      '2026-06-01 11:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      NULL,
      'SECRETARY',
      'APPROVED'::public.appointment_status,
      'CHECKED_IN'::public.appointment_status,
      'Patient checked-in.',
      '2026-06-05 14:55:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      'DOCTOR',
      'CHECKED_IN'::public.appointment_status,
      'TREATMENT_RENDERED'::public.appointment_status,
      'Teeth cleaning procedure completed by doctor.',
      '2026-06-05 15:25:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      NULL,
      'SECRETARY',
      'TREATMENT_RENDERED'::public.appointment_status,
      'COMPLETED'::public.appointment_status,
      'Checkout complete, invoice paid.',
      '2026-06-05 15:40:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cc6 (CANCELLED)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-05-28 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Approved by staff.',
      '2026-05-28 10:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
      v_patient_id,
      'PATIENT',
      'APPROVED'::public.appointment_status,
      'CANCELLED'::public.appointment_status,
      'Cancelled by user: Family emergency.',
      '2026-05-30 14:00:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cc7 (REJECTED)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc7',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-05-20 10:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc7',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'REJECTED'::public.appointment_status,
      'Rejected by staff: Roster conflict / doctor unavailable.',
      '2026-05-20 15:00:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cc8 (DISPLACED)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc8',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-05-10 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc8',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Approved.',
      '2026-05-10 11:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc8',
      NULL,
      'SECRETARY',
      'APPROVED'::public.appointment_status,
      'DISPLACED'::public.appointment_status,
      'Displaced: Clinic closed on holiday schedule.',
      '2026-05-18 08:00:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cc9 (NO_SHOW)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc9',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-05-10 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc9',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Approved.',
      '2026-05-10 11:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc9',
      NULL,
      'SECRETARY',
      'APPROVED'::public.appointment_status,
      'NO_SHOW'::public.appointment_status,
      'No-show recorded: Patient failed to attend.',
      '2026-05-15 11:00:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cd0 (TREATMENT_RENDERED)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-06-08 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Approved.',
      '2026-06-08 11:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0',
      NULL,
      'SECRETARY',
      'APPROVED'::public.appointment_status,
      'CHECKED_IN'::public.appointment_status,
      'Patient checked in.',
      '2026-06-12 15:55:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0',
      'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      'DOCTOR',
      'CHECKED_IN'::public.appointment_status,
      'TREATMENT_RENDERED'::public.appointment_status,
      'Treatment submitted by doctor; draft invoice created.',
      '2026-06-12 16:30:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cd1 (APPROVED - Reschedule Rejected)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd1',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-06-10 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd1',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Approved.',
      '2026-06-10 11:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd1',
      v_patient_id,
      'PATIENT',
      'APPROVED'::public.appointment_status,
      'RESCHEDULE_REQUESTED'::public.appointment_status,
      'Requested to move to 2026-07-20.',
      '2026-06-12 14:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd1',
      NULL,
      'SECRETARY',
      'RESCHEDULE_REQUESTED'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Previously requested reschedule was rejected due to full schedule.',
      '2026-06-13 09:00:00+00'
    ),

    -- b3b07384-d113-4ec2-a5e6-ec083b0f5cd2 (APPROVED - Reschedule Approved)
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd2',
      v_patient_id,
      'PATIENT',
      NULL,
      'PENDING'::public.appointment_status,
      'Initial booking request submitted',
      '2026-06-10 09:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd2',
      NULL,
      'SECRETARY',
      'PENDING'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Approved.',
      '2026-06-10 11:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd2',
      v_patient_id,
      'PATIENT',
      'APPROVED'::public.appointment_status,
      'RESCHEDULE_REQUESTED'::public.appointment_status,
      'Requested to move to 2026-07-25.',
      '2026-06-12 14:00:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd2',
      NULL,
      'SECRETARY',
      'RESCHEDULE_REQUESTED'::public.appointment_status,
      'APPROVED'::public.appointment_status,
      'Your reschedule request was approved by the staff. Your appointment has been successfully moved to this new date.',
      '2026-06-13 09:00:00+00'
    );

    -- 7. Seed Appointment Treatments for Clinical Records
    INSERT INTO public.appointment_treatments (
      appointment_id,
      service_id,
      comment,
      created_at
    ) VALUES
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5', -- COMPLETED
      (SELECT id FROM services WHERE name = 'Oral Prophylaxis (Teeth Cleaning)' LIMIT 1),
      'Routine scale and polish completed successfully.',
      '2026-06-05 15:25:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0', -- TREATMENT_RENDERED
      (SELECT id FROM services WHERE name = 'Orthodontic Consultation' LIMIT 1),
      'Adjustment of braces done.',
      '2026-06-12 16:30:00+00'
    );

    -- 8. Seed Invoices for Billing System
    INSERT INTO public.invoices (
      appointment_id,
      amount,
      status,
      payment_method,
      discount_applied,
      created_at,
      updated_at
    ) VALUES
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cc5', -- COMPLETED
      1500.00,
      'PAID'::public.invoice_status,
      'CARD'::public.payment_method,
      0.00,
      '2026-06-05 15:25:00+00',
      '2026-06-05 15:40:00+00'
    ),
    (
      'b3b07384-d113-4ec2-a5e6-ec083b0f5cd0', -- TREATMENT_RENDERED
      1000.00,
      'DRAFT'::public.invoice_status,
      NULL,
      0.00,
      '2026-06-12 16:30:00+00',
      '2026-06-12 16:30:00+00'
    );


  END $$;

