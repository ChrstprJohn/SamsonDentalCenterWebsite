import { z } from 'zod';

export const resendReminderSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
  reminderType: z.enum(['24H', '48H']),
});

export type ResendReminderDto = z.infer<typeof resendReminderSchema>;
