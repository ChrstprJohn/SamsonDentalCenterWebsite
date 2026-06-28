import { z } from 'zod';

export const requestRescheduleSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
  status: z.literal('RESCHEDULE_REQUESTED'),
  statusReason: z.string().trim().min(1, 'Reason is required for reschedule requests'),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  newStartTime: z.string().datetime(),
  newEndTime: z.string().datetime(),
  newDoctorId: z.string().uuid('Invalid Doctor ID format'),
});

export type RequestRescheduleDto = z.infer<typeof requestRescheduleSchema>;
