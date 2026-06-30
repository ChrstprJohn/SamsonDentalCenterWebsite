import { z } from 'zod';

export const getOutboxLogsSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'PROCESSED', 'FAILED']).optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
});

export type GetOutboxLogsDto = z.infer<typeof getOutboxLogsSchema>;
