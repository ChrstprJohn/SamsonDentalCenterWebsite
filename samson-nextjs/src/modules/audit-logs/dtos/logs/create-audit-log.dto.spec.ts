import { describe, expect, it } from 'vitest';
import { createAuditLogSchema } from './create-audit-log.dto';

describe('createAuditLogSchema', () => {
  it('accepts valid data', () => {
    const result = createAuditLogSchema.safeParse({
      actorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      action: 'APPROVED_APPOINTMENT',
      targetId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
      reason: 'Patient called to request',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUIDs', () => {
    const result = createAuditLogSchema.safeParse({
      actorId: 'invalid',
      action: 'X',
      targetId: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});
