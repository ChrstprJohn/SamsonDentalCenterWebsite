import { describe, it, expect } from 'vitest';
import { outboxLogResponseSchema } from './outbox-log-response.dto';

describe('outboxLogResponseSchema', () => {
  it('should transform database schema to camelCase application DTO', () => {
    const raw = {
      id: 'd9b7f54c-1111-4444-9999-555555555555',
      event_type: 'PATIENT_REGISTERED',
      payload: { email: 'test@example.com' },
      status: 'FAILED',
      error_logs: 'Something went wrong',
      retry_count: 2,
      created_at: '2026-06-29T08:00:00.000Z',
    };

    const parsed = outboxLogResponseSchema.parse(raw);
    expect(parsed.id).toBe(raw.id);
    expect(parsed.eventType).toBe(raw.event_type);
    expect(parsed.errorLogs).toBe(raw.error_logs);
    expect(parsed.retryCount).toBe(2);
  });
});
