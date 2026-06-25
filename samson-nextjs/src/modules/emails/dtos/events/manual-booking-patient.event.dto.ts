import { z } from 'zod';

export const manualBookingPatientEventSchema = z.object({
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.string(),
  startTime: z.string(),
  durationMinutes: z.number().int().positive(),
  // Optional: set when appointment is for a dependent, not the account holder
  dependentId: z.string().uuid().nullable().optional(),
  dependentName: z.string().nullable().optional(),
});

export type ManualBookingPatientEventDto = z.infer<typeof manualBookingPatientEventSchema>;
