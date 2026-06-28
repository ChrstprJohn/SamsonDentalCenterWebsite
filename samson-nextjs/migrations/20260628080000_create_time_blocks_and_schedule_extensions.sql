-- Migration: Create time_blocks and extend doctor_schedules for 3-layer scheduling

-- 1. Create time_blocks table (Layer 3 Exceptions)
CREATE TABLE IF NOT EXISTS public.time_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL means clinic-wide block
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason TEXT NOT NULL CHECK (char_length(reason) >= 3),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT valid_exclusion_time_range CHECK (start_time <= end_time)
);

-- Indexes for fast availability resolution
CREATE INDEX IF NOT EXISTS idx_time_blocks_doctor_date ON public.time_blocks(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON public.time_blocks(date);

-- 2. Alter doctor_schedules to support is_custom and is_open
ALTER TABLE public.doctor_schedules 
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT TRUE NOT NULL;

-- Allow start_time and end_time to be nullable for closed days
ALTER TABLE public.doctor_schedules ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE public.doctor_schedules ALTER COLUMN end_time DROP NOT NULL;

-- Drop old constraints and add updated ones
ALTER TABLE public.doctor_schedules DROP CONSTRAINT IF EXISTS valid_time_range;
ALTER TABLE public.doctor_schedules DROP CONSTRAINT IF EXISTS valid_break_range;

ALTER TABLE public.doctor_schedules 
ADD CONSTRAINT valid_time_range CHECK (
    is_open = false OR (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
);

ALTER TABLE public.doctor_schedules 
ADD CONSTRAINT valid_break_range CHECK (
    is_open = false OR break_start_time IS NULL OR (
        break_start_time < break_end_time AND 
        break_start_time >= start_time AND 
        break_end_time <= end_time
    )
);

-- Enable RLS for time_blocks
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- Policies for time_blocks
CREATE POLICY "Allow public read access to time_blocks" 
ON public.time_blocks FOR SELECT 
USING (true);

CREATE POLICY "Allow staff to insert/update/delete time_blocks" 
ON public.time_blocks FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('SECRETARY', 'ADMIN')
    )
);
