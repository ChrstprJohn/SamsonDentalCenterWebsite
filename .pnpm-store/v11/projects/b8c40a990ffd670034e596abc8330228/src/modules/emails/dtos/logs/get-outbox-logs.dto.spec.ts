import { describe, it, expect } from 'vitest';
import { getOutboxLogsSchema } from './get-outbox-logs.dto';

describe('getOutboxLogsSchema', () => {
  it('should validate correct filter parameters', () => {
    const valid = {
      status: 'FAILED',
      search: 'test@example.com',
      limit: 10,
      page: 1,
    };
    const result = getOutboxLogsSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should allow empty parameters', () => {
    const result = getOutboxLogsSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
