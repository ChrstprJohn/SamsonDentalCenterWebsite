import { z } from 'zod';

export const undoCheckInSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
});

export type UndoCheckInDto = z.infer<typeof undoCheckInSchema>;
