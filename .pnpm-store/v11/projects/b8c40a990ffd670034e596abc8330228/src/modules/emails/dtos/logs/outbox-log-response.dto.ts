import { z } from 'zod';

const outboxDbRecordSchema = z.object({
  id: z.string().uuid(),
  event_type: z.string(),
  payload: z.record(z.string(), z.any()),
  status: z.enum(['PENDING', 'PROCESSING', 'PROCESSED', 'FAILED']),
  error_logs: z.string().nullable().optional(),
  retry_count: z.number().int().nonnegative().default(0),
  created_at: z.string().optional(),
});

export const outboxLogResponseSchema = outboxDbRecordSchema.transform((data) => ({
  id: data.id,
  eventType: data.event_type,
  payload: data.payload,
  status: data.status,
  errorLogs: data.error_logs ?? null,
  retryCount: data.retry_count,
  createdAt: data.created_at ?? new Date().toISOString(),
}));

export type OutboxLogResponseDto = z.infer<typeof outboxLogResponseSchema>;

export const mapOutboxRecord = (record: Record<string, unknown>): OutboxLogResponseDto => {
  return outboxLogResponseSchema.parse(record);
};

export const mapOutboxRecords = (records: Record<string, unknown>[]): OutboxLogResponseDto[] => {
  return records.map(mapOutboxRecord);
};
