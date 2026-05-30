import { z } from 'zod';

export const servicePerformedSchema = z.object({
  serviceId: z.string().uuid('Service ID must be a valid UUID'),
  comment: z.string().optional().nullable(),
});

export const submitTreatmentSchema = z.object({
  appointmentId: z.string().uuid('Appointment ID must be a valid UUID'),
  actualServices: z.array(servicePerformedSchema).min(1, 'At least one service must be performed'),
  clinicalNotes: z.string().optional().nullable(),
});

export type SubmitTreatmentDto = z.infer<typeof submitTreatmentSchema>;
