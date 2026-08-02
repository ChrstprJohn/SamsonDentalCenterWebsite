import { z } from 'zod';

export const undoCheckInSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
  reason: z.string().min(3, 'Reason must be at least 3 characters long').optional(),
});

export type UndoCheckInDto = z.infer<typeof undoCheckInSchema>;
