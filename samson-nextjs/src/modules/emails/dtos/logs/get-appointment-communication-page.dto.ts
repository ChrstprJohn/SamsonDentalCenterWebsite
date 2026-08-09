/**
 * @deprecated Communication History feature removed from UI.
 * Failed notifications are resent via the Notification Lifecycle tab in the
 * appointment detail pane (AppointmentNotificationsTab). Kept for reference only.
 */
import { z } from 'zod';

export const getAppointmentCommunicationPageSchema = z.object({
  appointmentId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().max(512).optional().nullable(),
});

export type GetAppointmentCommunicationPageDto = z.infer<typeof getAppointmentCommunicationPageSchema>;
