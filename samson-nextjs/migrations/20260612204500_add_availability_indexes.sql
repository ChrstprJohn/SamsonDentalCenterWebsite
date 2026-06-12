-- Migration to add B-Tree indexes on foreign keys and lookup columns

-- 1. doctor_services indexes (junction table for doctor/service mapping)
CREATE INDEX IF NOT EXISTS idx_doctor_services_service_id ON public.doctor_services(service_id);
CREATE INDEX IF NOT EXISTS idx_doctor_services_doctor_id ON public.doctor_services(doctor_id);

-- 2. doctor_schedules indexes (for daily day_of_week lookups)
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_day_of_week ON public.doctor_schedules(day_of_week);

-- 3. appointments indexes (crucial for daily/monthly availability checks and billing)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);

-- 4. users role and active flags (used to fetch active doctors)
CREATE INDEX IF NOT EXISTS idx_users_role_active ON public.users(role, is_active);
