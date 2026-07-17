ALTER TABLE appointment_inquiries
ADD COLUMN assigned_doctor_id uuid,
ADD COLUMN assigned_end_time text;
