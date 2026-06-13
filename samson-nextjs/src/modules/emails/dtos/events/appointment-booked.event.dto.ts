import { z } from 'zod';

export const appointmentBookedEventSchema = z.object({
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.string(),
  startTime: z.string(),
  durationMinutes: z.number().int().positive(),
  dependentId: z.string().uuid().nullable().optional(),
});

export type AppointmentBookedEventDto = z.infer<typeof appointmentBookedEventSchema>;
