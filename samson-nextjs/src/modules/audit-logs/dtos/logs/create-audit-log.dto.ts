import { z } from 'zod';

export const createAuditLogSchema = z.object({
  actorId: z.string().uuid('Actor ID must be a valid UUID'),
  action: z.string().min(1, 'Action description is required'),
  targetId: z.string().uuid('Target ID must be a valid UUID'),
  reason: z.string().optional().nullable(),
});

export type CreateAuditLogDto = z.infer<typeof createAuditLogSchema>;
