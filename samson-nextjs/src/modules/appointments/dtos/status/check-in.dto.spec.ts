import { describe, it, expect } from 'vitest';
import { checkInSchema } from './check-in.dto';

describe('checkInSchema', () => {
  it('passes validation for valid UUID', () => {
    const result = checkInSchema.safeParse({ appointmentId: '123e4567-e89b-12d3-a456-426614174000' });
    expect(result.success).toBe(true);
  });

  it('fails validation for invalid UUID', () => {
    const result = checkInSchema.safeParse({ appointmentId: 'invalid-uuid' });
    expect(result.success).toBe(false);
  });
});
