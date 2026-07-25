import { z } from 'zod';

export const resolveNoShowSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
  resolution: z.enum(['COMPLETED', 'CONFIRMED_NO_SHOW', 'RESCHEDULE']),
  reason: z.string().min(3, 'Reason must be at least 3 characters long'),
  newDate: z.string().optional(),
  newStartTime: z.string().optional(),
  newEndTime: z.string().optional(),
  newDoctorId: z.string().uuid().optional(),
});

export type ResolveNoShowDto = z.infer<typeof resolveNoShowSchema>;
