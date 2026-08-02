import { z } from 'zod';

export const checkInSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
  reason: z.string().min(3, 'Reason must be at least 3 characters long').optional(),
});

export type CheckInDto = z.infer<typeof checkInSchema>;
