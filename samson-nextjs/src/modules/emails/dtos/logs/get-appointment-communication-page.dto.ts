import { z } from 'zod';

export const getAppointmentCommunicationPageSchema = z.object({
  appointmentId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().max(512).optional().nullable(),
});

export type GetAppointmentCommunicationPageDto = z.infer<typeof getAppointmentCommunicationPageSchema>;
