import { z } from 'zod';

export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid('Invalid Appointment ID format'),
  status: z.literal('CANCELLED'),
  statusReason: z.string().trim().min(1, 'Reason is strictly required for your action.'),
});

export type CancelAppointmentDto = z.infer<typeof cancelAppointmentSchema>;
