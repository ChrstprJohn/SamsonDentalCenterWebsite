-- ============================================================================
-- 🦷 Samson Dental - ACID Compliant 3NF Database Schema (PostgreSQL)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Required for overlapping time-range constraints

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('PATIENT', 'SECRETARY', 'DOCTOR', 'ADMIN');
CREATE TYPE dependent_relationship AS ENUM ('CHILD', 'SPOUSE', 'PARENT', 'SIBLING', 'OTHER');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');
CREATE TYPE service_type AS ENUM ('GENERAL', 'SPECIALIZED');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'RESCHEDULE_REQUESTED', 'DISPLACED', 'CHECKED_IN', 'TREATMENT_RENDERED', 'COMPLETED', 'NO_SHOW');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'FINALIZED', 'PAID', 'VOID');
CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'HMO');

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
    cancel_count INT DEFAULT 0 NOT NULL,
    no_show_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- DEPENDENTS (Normalized family members)
CREATE TABLE dependents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender,
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
    patient_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    dependent_id UUID REFERENCES dependents(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT NOT NULL,
    doctor_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status appointment_status DEFAULT 'PENDING'::appointment_status NOT NULL,
    user_note TEXT,
    status_reason TEXT,
    clinical_notes TEXT, 
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

