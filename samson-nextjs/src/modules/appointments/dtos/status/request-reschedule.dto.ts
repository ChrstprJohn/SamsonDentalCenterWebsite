import { z } from 'zod';

export const requestRescheduleSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
  status: z.literal('RESCHEDULE_REQUESTED'),
  statusReason: z.string().trim().min(1, 'Reason is required for reschedule requests'),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  newStartTime: z.string().datetime().optional(),
  newEndTime: z.string().datetime().optional(),
  newDoctorId: z.string().uuid('Invalid Doctor ID format').nullable(),
  preferredStartTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Preferred start time must be in HH:MM format').optional(),
});

export type RequestRescheduleDto = z.infer<typeof requestRescheduleSchema>;
