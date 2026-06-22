import { z } from 'zod';

export const manualBookingPatientEventSchema = z.object({
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.string(),
  startTime: z.string(),
  durationMinutes: z.number().int().positive(),
});

export type ManualBookingPatientEventDto = z.infer<typeof manualBookingPatientEventSchema>;
