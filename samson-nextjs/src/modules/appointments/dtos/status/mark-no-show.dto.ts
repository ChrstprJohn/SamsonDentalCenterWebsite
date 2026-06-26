import { z } from 'zod';

export const markNoShowSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
});

export type MarkNoShowDto = z.infer<typeof markNoShowSchema>;
