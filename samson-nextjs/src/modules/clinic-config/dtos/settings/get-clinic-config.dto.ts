import { z } from "zod";

export const ClinicConfigResponseSchema = z.object({
  is_booking_open: z.boolean(),
  maintenance_message: z.string().nullable(),
  max_reschedules: z.number().int().min(0),
  clinic_name: z.string().min(1, "Clinic name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  operating_hours: z.string().min(1, "Operating hours are required"),
});

export type ClinicConfigResponseDto = z.infer<typeof ClinicConfigResponseSchema>;

