import { describe, expect, it } from 'vitest';
import { getAuditLogsSchema } from './get-audit-logs.dto';

describe('getAuditLogsSchema', () => {
  it('accepts valid filtering parameters', () => {
    const result = getAuditLogsSchema.safeParse({
      actorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      action: 'MARKED_NO_SHOW',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty parameters', () => {
    const result = getAuditLogsSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
