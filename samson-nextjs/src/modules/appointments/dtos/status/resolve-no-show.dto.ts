import { z } from 'zod';

export const resolveNoShowSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
  resolution: z.enum(['COMPLETED', 'CONFIRMED_NO_SHOW', 'RESCHEDULE', 'CHECKED_IN']),
  reason: z.string().min(3, 'Reason must be at least 3 characters long'),
  newDate: z.string().optional(),
  newStartTime: z.string().optional(),
  newEndTime: z.string().optional(),
  newDoctorId: z.string().uuid().optional(),
  /** Notification channel resolved by the UI before submitting — avoids DB re-fetch race condition. */
  confirmationChannel: z.enum(['EMAIL', 'SMS', 'BOTH', 'NONE']).optional(),
});

export type ResolveNoShowDto = z.infer<typeof resolveNoShowSchema>;
