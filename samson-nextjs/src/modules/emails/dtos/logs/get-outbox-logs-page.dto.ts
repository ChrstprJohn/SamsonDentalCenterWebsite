import { z } from 'zod';

export const getOutboxLogsPageSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().max(512).optional().nullable(),
  status: z.enum(['PENDING', 'PROCESSING', 'PROCESSED', 'FAILED']).optional(),
  search: z.string().trim().max(120).optional().or(z.literal('').transform(() => undefined)),
  channel: z.enum(['ALL', 'EMAIL', 'SMS']).default('ALL'),
  category: z.enum(['ALL', 'APPOINTMENTS', 'INQUIRIES']).optional().default('ALL'),
  onlyAppointments: z.boolean().default(false),
  dateFrom: z.string().max(64).optional().nullable(),
  dateTo: z.string().max(64).optional().nullable(),
});

export type GetOutboxLogsPageDto = z.input<typeof getOutboxLogsPageSchema>;
