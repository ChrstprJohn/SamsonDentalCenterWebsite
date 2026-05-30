import { z } from 'zod';

export const submitTreatmentSchema = z.object({
  appointmentId: z.string().uuid('Appointment ID must be a valid UUID'),
  actualServiceIds: z.array(z.string().uuid('Service ID must be a valid UUID')).min(1, 'At least one service must be performed'),
  clinicalNotes: z.string().optional().nullable(),
});

export type SubmitTreatmentDto = z.infer<typeof submitTreatmentSchema>;
