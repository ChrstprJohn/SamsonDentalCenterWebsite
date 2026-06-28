import { describe, it, expect } from 'vitest';
import { markNoShowSchema } from './mark-no-show.dto';

describe('markNoShowSchema', () => {
  it('passes validation for valid UUID', () => {
    const result = markNoShowSchema.safeParse({ appointmentId: '123e4567-e89b-12d3-a456-426614174000' });
    expect(result.success).toBe(true);
  });

  it('fails validation for invalid UUID', () => {
    const result = markNoShowSchema.safeParse({ appointmentId: 'invalid-uuid' });
    expect(result.success).toBe(false);
  });
});
