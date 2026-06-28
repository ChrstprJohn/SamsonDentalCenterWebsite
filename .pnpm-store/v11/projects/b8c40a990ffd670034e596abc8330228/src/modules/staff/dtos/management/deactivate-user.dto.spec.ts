import { describe, it, expect } from 'vitest';
import { deactivateUserSchema } from './deactivate-user.dto';

describe('DeactivateUserDto', () => {
  it('should validate', () => {
    const result = deactivateUserSchema.safeParse({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      reason: 'Violated terms',
    });
    expect(result.success).toBe(true);
  });
});
