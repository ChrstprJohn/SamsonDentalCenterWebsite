import { z } from 'zod';

export const getAppointmentByIdSchema = z.object({
  appointmentId: z.string().uuid({ message: 'Invalid appointment ID format (must be a valid UUID)' }),
});

export type GetAppointmentByIdDto = z.infer<typeof getAppointmentByIdSchema>;
