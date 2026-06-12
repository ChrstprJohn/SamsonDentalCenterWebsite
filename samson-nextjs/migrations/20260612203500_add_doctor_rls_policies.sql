-- ============================================================================
-- 🦷 Samson Dental - Enable RLS & Add Public Select Policies for Doctors
-- ============================================================================

-- Enable RLS on doctor_services and doctor_schedules
ALTER TABLE public.doctor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read/select access to all users (both authenticated and anonymous)
-- since doctor mappings and working hours are required for public calendar booking wizard.
CREATE POLICY "Allow public read access to doctor_services"
ON public.doctor_services
FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to doctor_schedules"
ON public.doctor_schedules
FOR SELECT
USING (true);
