import { describe, expect, it } from 'vitest';
import { auditLogResponseSchema } from './audit-log-response.dto';

describe('auditLogResponseSchema', () => {
  it('maps database record to standard camelCase properties', () => {
    const record = {
      id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      actor_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
      action: 'MARKED_NO_SHOW',
      target_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
      reason: 'Patient did not arrive',
      created_at: '2026-05-30T13:55:59.000Z',
    };

    const mapped = auditLogResponseSchema.parse(record);
    expect(mapped.actorId).toBe('da95a63c-333e-4b68-98e3-82bdf1a07bd3');
    expect(mapped.targetId).toBe('da95a63c-333e-4b68-98e3-82bdf1a07bd4');
    expect(mapped.createdAt).toBe('2026-05-30T13:55:59.000Z');
  });
});
