import { z } from 'zod';

export const auditLogDbSchema = z.object({
  id: z.string().uuid(),
  actor_id: z.string().uuid(),
  action: z.string(),
  target_id: z.string().uuid(),
  reason: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

export const auditLogResponseSchema = auditLogDbSchema.transform((record) => ({
  id: record.id,
  actorId: record.actor_id,
  action: record.action,
  targetId: record.target_id,
  reason: record.reason ?? null,
  createdAt: record.created_at,
}));

export type AuditLogResponseDto = z.infer<typeof auditLogResponseSchema>;
