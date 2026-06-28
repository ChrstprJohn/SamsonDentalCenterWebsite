import { z } from 'zod';

export const checkInSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
});

export type CheckInDto = z.infer<typeof checkInSchema>;
