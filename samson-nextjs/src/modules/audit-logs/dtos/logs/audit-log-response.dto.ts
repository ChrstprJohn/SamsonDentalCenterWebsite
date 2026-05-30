import { z } from 'zod';
import { stringValue } from '@/shared/utils';

export const auditLogResponseSchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  action: z.string(),
  targetId: z.string().uuid(),
  reason: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

export type AuditLogResponseDto = z.infer<typeof auditLogResponseSchema>;

type MaybeRecord = Record<string, unknown>;

export const mapAuditLogRecord = (record: MaybeRecord): AuditLogResponseDto => ({
  id: stringValue(record.id),
  actorId: stringValue(record.actor_id ?? record.actorId),
  action: stringValue(record.action),
  targetId: stringValue(record.target_id ?? record.targetId),
  reason: typeof record.reason === 'string' && record.reason.length > 0 ? record.reason : null,
  createdAt: typeof record.created_at === 'string' ? record.created_at : undefined,
});

export const mapAuditLogRecords = (records: MaybeRecord[]): AuditLogResponseDto[] =>
  records.map((record) => mapAuditLogRecord(record));
