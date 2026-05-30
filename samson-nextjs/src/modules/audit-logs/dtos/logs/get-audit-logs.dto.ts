import { z } from 'zod';

export const getAuditLogsSchema = z.object({
  actorId: z.string().uuid('Actor ID must be a valid UUID').optional(),
  action: z.string().optional(),
  targetId: z.string().uuid('Target ID must be a valid UUID').optional(),
});

export type GetAuditLogsDto = z.infer<typeof getAuditLogsSchema>;
