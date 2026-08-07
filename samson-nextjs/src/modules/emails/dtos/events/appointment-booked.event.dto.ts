import { z } from 'zod';

export const appointmentBookedEventSchema = z.object({
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  doctorId: z.string().uuid().nullable().optional(),
  date: z.string(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  durationMinutes: z.number().int().positive().optional(),
  dependentId: z.string().uuid().nullable().optional(),
});

export type AppointmentBookedEventDto = z.infer<typeof appointmentBookedEventSchema>;
