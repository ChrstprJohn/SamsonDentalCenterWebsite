/**
 * @deprecated Communication History feature removed from UI.
 * Failed notifications are resent via the Notification Lifecycle tab in the
 * appointment detail pane (AppointmentNotificationsTab). Kept for reference only.
 */
import { z } from 'zod';

export const getCommunicationSummaryPageSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().max(512).optional().nullable(),
  tab: z.enum(['all', 'failed']).default('all'),
  search: z.string().trim().max(120).optional().or(z.literal('').transform(() => undefined)),
});

export type GetCommunicationSummaryPageDto = z.infer<typeof getCommunicationSummaryPageSchema>;

export interface CommunicationSummaryDto {
  id: string;
  patientName: string;
  treatmentName: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  doctorName: string;
  channelsUsed: { email: boolean; sms: boolean };
  lastActivity: string | null;
  hasFailed: boolean;
  failureCount: number;
  latestEventPreview?: string;
}
