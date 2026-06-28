-- ============================================================================
-- 🦷 Samson Dental - ACID Compliant 3NF Database Schema (PostgreSQL)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Required for overlapping time-range constraints

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('PATIENT', 'SECRETARY', 'DOCTOR', 'ADMIN');
CREATE TYPE dependent_relationship AS ENUM ('CHILD', 'SPOUSE', 'PARENT', 'SIBLING', 'OTHER');
CREATE TYPE service_type AS ENUM ('GENERAL', 'SPECIALIZED');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'RESCHEDULE_REQUESTED', 'DISPLACED', 'CHECKED_IN', 'TREATMENT_RENDERED', 'COMPLETED', 'NO_SHOW');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'FINALIZED', 'PAID', 'VOID');
CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'HMO');
CREATE TYPE inquiry_status AS ENUM ('NEW', 'CONVERTED', 'DROPPED');
CREATE TYPE appointment_source AS ENUM ('SELF_BOOKED', 'STAFF_CREATED');
CREATE TYPE service_status AS ENUM ('ACTIVE', 'HIDDEN', 'ARCHIVED');

-- 3. CORE TABLES

-- USERS (Unified Identity for Patients, Doctors, Secretaries, Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    suffix TEXT,
    phone_number TEXT,
    date_of_birth DATE, 
    role user_role DEFAULT 'PATIENT'::user_role NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'HIDDEN', 'ARCHIVED')) NOT NULL,
    cancel_count INT DEFAULT 0 NOT NULL,
    no_show_count INT DEFAULT 0 NOT NULL,
    reschedule_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- DEPENDENTS (Normalized family members)
CREATE TABLE dependents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    suffix TEXT,
    date_of_birth DATE NOT NULL,
    relationship dependent_relationship DEFAULT 'OTHER'::dependent_relationship NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- SERVICES
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    price NUMERIC(10, 2) CHECK (price >= 0),
    service_type service_type DEFAULT 'GENERAL'::service_type NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    image_url TEXT,
    status service_status DEFAULT 'ACTIVE'::service_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- DOCTOR_SERVICES (Junction Table: Many-to-Many)
CREATE TABLE doctor_services (
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (doctor_id, service_id)
);

-- DOCTOR_SCHEDULES
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start_time TIME,
    break_end_time TIME,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_doctor_day UNIQUE (doctor_id, day_of_week),
    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    CONSTRAINT valid_break_range CHECK (break_start_time IS NULL OR (break_start_time < break_end_time AND break_start_time >= start_time AND break_end_time <= end_time))
);

-- CLINIC_CONFIG (Singleton pattern enforced by a boolean flag)
CREATE TABLE clinic_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_singleton BOOLEAN DEFAULT true UNIQUE NOT NULL CHECK (is_singleton = true),
    clinic_name TEXT NOT NULL DEFAULT 'Samson Dental',
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    operating_hours JSONB NOT NULL,
    is_booking_open BOOLEAN DEFAULT true NOT NULL,
    maintenance_message TEXT,
    max_reschedules INT DEFAULT 1 NOT NULL,
    allow_same_day_booking BOOLEAN DEFAULT false NOT NULL,
    calendar_render_days INT DEFAULT 30 NOT NULL,
    social_links JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- APPOINTMENTS
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE RESTRICT, -- Nullable to allow guest appointments converted from inquiries
    dependent_id UUID REFERENCES dependents(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT NOT NULL,
    doctor_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status appointment_status DEFAULT 'PENDING'::appointment_status NOT NULL,
    source appointment_source DEFAULT 'SELF_BOOKED'::appointment_source NOT NULL,
    user_note TEXT,
    status_reason TEXT,
    clinical_notes TEXT, 
    proposed_date DATE,
    proposed_start_time TIMESTAMPTZ,
    proposed_end_time TIMESTAMPTZ,
    proposed_doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reschedule_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- ACID CONSTRAINT: Prevent overlapping appointments for the same doctor
    CONSTRAINT no_overlapping_appointments EXCLUDE USING gist (
        doctor_id WITH =,
        tstzrange(start_time, end_time) WITH &&
    ),
    CONSTRAINT valid_appointment_time CHECK (start_time < end_time)
);

-- APPOINTMENT_INQUIRIES (For landing page unauthenticated guest booking leads)
CREATE TABLE appointment_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    suffix TEXT,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    preferred_service_id UUID REFERENCES services(id) ON DELETE RESTRICT NOT NULL,
    preferred_date DATE NOT NULL,
    patient_note TEXT,
    status inquiry_status DEFAULT 'NEW'::inquiry_status NOT NULL,
    secretary_notes TEXT,
    linked_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- APPOINTMENT_STATUS_HISTORY (Ledger for status changes)
CREATE TABLE appointment_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role TEXT NOT NULL,
    previous_status appointment_status,
    new_status appointment_status NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- APPOINTMENT_TREATMENTS (Actual services performed)
CREATE TABLE appointment_treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- INVOICES
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE RESTRICT UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    status invoice_status DEFAULT 'DRAFT'::invoice_status NOT NULL,
    payment_method payment_method,
    discount_applied NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (discount_applied >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- AUDIT_LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id UUID NOT NULL, 
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. TRIGGERS (Auto-update 'updated_at' columns)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_dependents_modtime BEFORE UPDATE ON dependents FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_services_modtime BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_doctor_schedules_modtime BEFORE UPDATE ON doctor_schedules FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_clinic_config_modtime BEFORE UPDATE ON clinic_config FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_appointment_inquiries_modtime BEFORE UPDATE ON appointment_inquiries FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    first_name, 
    last_name, 
    middle_name, 
    suffix, 
    phone_number, 
    date_of_birth, 
    role, 
    is_active
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'firstName', 'Unknown'), 
    COALESCE(NEW.raw_user_meta_data->>'lastName', 'Unknown'), 
    NEW.raw_user_meta_data->>'middleName', 
    NEW.raw_user_meta_data->>'suffix', 
    COALESCE(NEW.raw_user_meta_data->>'phoneNumber', ''), 
    NULLIF(NEW.raw_user_meta_data->>'dateOfBirth', '')::DATE, 
    'PATIENT'::public.user_role,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. EVENT-DRIVEN ARCHITECTURE (Transactional Outbox)
-- ============================================================================
CREATE TYPE outbox_status AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

CREATE TABLE outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status outbox_status DEFAULT 'PENDING'::outbox_status NOT NULL,
    error_logs TEXT,
    retry_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_outbox_modtime BEFORE UPDATE ON outbox FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE OR REPLACE FUNCTION claim_pending_events(batch_size INT)
RETURNS SETOF outbox AS $$
BEGIN
    RETURN QUERY
    WITH locked_rows AS (
        SELECT outbox.id FROM outbox
        WHERE status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT claim_pending_events.batch_size
        FOR UPDATE SKIP LOCKED
    )
    UPDATE outbox
    SET status = 'PROCESSING'::outbox_status, updated_at = CURRENT_TIMESTAMP
    WHERE outbox.id IN (SELECT id FROM locked_rows)
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read/select access to all users (both authenticated and anonymous)
-- since the services catalog is a public marketing resource.
CREATE POLICY "Allow public read access to services"
ON public.services
FOR SELECT
USING (true);

-- Create policy to allow write access (insert/update/delete) for ADMIN users
CREATE POLICY "Allow write access to admin users"
ON public.services
FOR ALL
TO authenticated
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'ADMIN'
)
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'ADMIN'
);


-- Enable RLS on dependents table
ALTER TABLE public.dependents ENABLE ROW LEVEL SECURITY;

-- Create policies for dependents table
CREATE POLICY "Allow select for owners and staff"
ON public.dependents
FOR SELECT
TO authenticated
USING (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
);

CREATE POLICY "Allow delete for owners and staff"
ON public.dependents
FOR DELETE
TO authenticated
USING (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('DOCTOR', 'SECRETARY', 'ADMIN')
);


-- Enable RLS on appointment_inquiries table
ALTER TABLE public.appointment_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public insert (unauthenticated guests submitting the landing page form)
CREATE POLICY "Allow public insert to appointment_inquiries"
ON public.appointment_inquiries
FOR INSERT
WITH CHECK (true);

-- Restrict select/write access to SECRETARY and ADMIN roles
CREATE POLICY "Allow select/write access to staff users for inquiries"
ON public.appointment_inquiries
FOR ALL
TO authenticated
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
)
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);

CREATE POLICY "Allow insert for owners and staff"
ON public.dependents
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);

CREATE POLICY "Allow update for owners and staff"
ON public.dependents
FOR UPDATE
TO authenticated
USING (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
)
WITH CHECK (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);

CREATE POLICY "Allow delete for owners and staff"
ON public.dependents
FOR DELETE
TO authenticated
USING (
  auth.uid() = patient_id OR
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) IN ('SECRETARY', 'ADMIN')
);



-- ============================================================================
-- 8. Atomic Transaction for Booking Submission
-- ============================================================================
-- Bypasses RLS using SECURITY DEFINER and groups dependent creation, appointment creation, and outbox event emission into a single ACID transaction.

CREATE OR REPLACE FUNCTION submit_booking_transaction(
    p_patient_id UUID,
    p_service_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_user_note TEXT,
    p_existing_dependent_id UUID DEFAULT NULL,
    p_new_dependent_first_name TEXT DEFAULT NULL,
    p_new_dependent_last_name TEXT DEFAULT NULL,
    p_new_dependent_date_of_birth DATE DEFAULT NULL,
    p_new_dependent_relationship dependent_relationship DEFAULT NULL,
    p_new_dependent_middle_name TEXT DEFAULT NULL,
    p_new_dependent_suffix TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_dependent_id UUID := p_existing_dependent_id;
    v_appointment_id UUID;
    v_outbox_payload JSONB;
    v_duration INT;
BEGIN
    -- 1. Create dependent if new dependent data is provided
    IF p_new_dependent_first_name IS NOT NULL AND p_new_dependent_last_name IS NOT NULL THEN
        INSERT INTO dependents (
            patient_id, 
            first_name, 
            middle_name,
            last_name, 
            suffix,
            date_of_birth, 
            relationship
        ) VALUES (
            p_patient_id, 
            p_new_dependent_first_name, 
            p_new_dependent_middle_name,
            p_new_dependent_last_name, 
            p_new_dependent_suffix,
            p_new_dependent_date_of_birth, 
            p_new_dependent_relationship
        ) RETURNING id INTO v_dependent_id;
    END IF;

    -- 2. Create appointment
    INSERT INTO appointments (
        patient_id,
        dependent_id,
        service_id,
        doctor_id,
        date,
        start_time,
        end_time,
        user_note,
        status,
        source
    ) VALUES (
        p_patient_id,
        v_dependent_id,
        p_service_id,
        p_doctor_id,
        p_date,
        p_start_time,
        p_end_time,
        p_user_note,
        'PENDING',
        'SELF_BOOKED'::appointment_source
    ) RETURNING id INTO v_appointment_id;

    -- Query duration from services
    SELECT duration_minutes INTO v_duration FROM services WHERE id = p_service_id;

    -- 3. Emit outbox event in the same transaction
    v_outbox_payload := jsonb_build_object(
        'appointmentId', v_appointment_id,
        'patientId', p_patient_id,
        'serviceId', p_service_id,
        'doctorId', p_doctor_id,
        'date', p_date,
        'startTime', p_start_time,
        'durationMinutes', v_duration,
        'dependentId', v_dependent_id
    );

    INSERT INTO outbox (event_type, payload, status)
    VALUES ('APPOINTMENT_BOOKED', v_outbox_payload, 'PENDING');

    -- 4. Insert initial PENDING ledger entry
    INSERT INTO appointment_status_history (
        appointment_id, 
        changed_by, 
        actor_role,
        previous_status, 
        new_status, 
        reason
    ) VALUES (
        v_appointment_id,
        p_patient_id,
        'PATIENT',
        NULL,
        'PENDING',
        'Initial booking request submitted'
    );

    RETURN v_appointment_id;
END;
$$;

-- ============================================================================
-- 9. Inquiry Conversion RPC
-- ============================================================================
CREATE OR REPLACE FUNCTION convert_inquiry_to_appointment(
    p_inquiry_id UUID,
    p_service_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_patient_note TEXT,
    p_secretary_notes TEXT,
    p_secretary_user_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_appointment_id UUID;
    v_outbox_payload JSONB;
    v_duration INT;
    v_inquiry_first_name TEXT;
    v_inquiry_last_name TEXT;
    v_inquiry_email TEXT;
    v_inquiry_phone TEXT;
BEGIN
    -- 1. Fetch guest inquiry information to snapshot on creation
    SELECT first_name, last_name, email, phone_number 
    INTO v_inquiry_first_name, v_inquiry_last_name, v_inquiry_email, v_inquiry_phone
    FROM appointment_inquiries 
    WHERE id = p_inquiry_id AND status = 'NEW';

    IF v_inquiry_first_name IS NULL THEN
        RAISE EXCEPTION 'Inquiry not found or already converted/dropped';
    END IF;

    -- 2. Create the appointment directly in APPROVED state
    INSERT INTO appointments (
        patient_id, -- NULL for guest/anonymous
        dependent_id, -- NULL
        service_id,
        doctor_id,
        date,
        start_time,
        end_time,
        status,
        source,
        user_note, -- Snapshot patient's landing page note
        status_reason -- Secretary's conversation notes
    ) VALUES (
        NULL,
        NULL,
        p_service_id,
        p_doctor_id,
        p_date,
        p_start_time,
        p_end_time,
        'APPROVED'::appointment_status,
        'STAFF_CREATED'::appointment_source,
        p_patient_note,
        p_secretary_notes
    ) RETURNING id INTO v_appointment_id;

    -- Query duration from services
    SELECT duration_minutes INTO v_duration FROM services WHERE id = p_service_id;

    -- 3. Emit outbox event for async guest email notifications
    v_outbox_payload := jsonb_build_object(
        'appointmentId', v_appointment_id,
        'serviceId', p_service_id,
        'doctorId', p_doctor_id,
        'date', p_date,
        'startTime', p_start_time,
        'durationMinutes', v_duration,
        'inquiryId', p_inquiry_id,
        'guestName', v_inquiry_first_name || ' ' || v_inquiry_last_name,
        'guestEmail', v_inquiry_email,
        'guestPhone', v_inquiry_phone
    );

    INSERT INTO outbox (event_type, payload, status)
    VALUES ('APPOINTMENT_CONVERTED_FROM_INQUIRY', v_outbox_payload, 'PENDING');

    -- 4. Insert initial APPROVED ledger entry in appointment history
    INSERT INTO appointment_status_history (
        appointment_id, 
        changed_by, 
        actor_role,
        previous_status, 
        new_status, 
        reason
    ) VALUES (
        v_appointment_id,
        p_secretary_user_id,
        'SECRETARY',
        NULL,
        'APPROVED'::appointment_status,
        COALESCE(p_secretary_notes, 'Inquiry converted to confirmed appointment')
    );

    -- 5. Mark inquiry as CONVERTED and link the appointment
    UPDATE appointment_inquiries
    SET status = 'CONVERTED'::inquiry_status,
        linked_appointment_id = v_appointment_id,
        patient_note = p_patient_note,
        secretary_notes = p_secretary_notes,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_inquiry_id;

    RETURN v_appointment_id;
END;
$$;
