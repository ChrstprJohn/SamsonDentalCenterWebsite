import { z } from 'zod';

export const appointmentDbSchema = z.object({
  id: z.string().uuid(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  doctor_id: z.string().uuid().nullable().optional(),
  status: z.string(),
  date: z.string(),
});

export const appointmentResponseSchema = appointmentDbSchema.transform((data) => ({
  id: data.id,
  startTime: data.start_time,
  endTime: data.end_time,
  doctorId: data.doctor_id || null,
  status: data.status,
  date: data.date,
}));

export type AppointmentResponseDto = z.infer<typeof appointmentResponseSchema>;
