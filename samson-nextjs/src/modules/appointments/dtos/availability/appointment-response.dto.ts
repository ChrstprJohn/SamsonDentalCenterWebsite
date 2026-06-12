import { z } from 'zod';

export const appointmentDbSchema = z.object({
  id: z.string().uuid(),
  start_time: z.string(),
  end_time: z.string(),
  doctor_id: z.string().uuid(),
  status: z.string(),
  date: z.string(),
});

export const appointmentResponseSchema = appointmentDbSchema.transform((data) => ({
  id: data.id,
  startTime: data.start_time,
  endTime: data.end_time,
  doctorId: data.doctor_id,
  status: data.status,
  date: data.date,
}));

export type AppointmentResponseDto = z.infer<typeof appointmentResponseSchema>;
