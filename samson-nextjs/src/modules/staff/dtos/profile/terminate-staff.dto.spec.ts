import { describe, it, expect } from 'vitest';
import { terminateStaffSchema } from './terminate-staff.dto';

describe('TerminateStaffDto', () => {
  it('should pass with a valid uuid', () => {
    const result = terminateStaffSchema.safeParse({ staffId: '123e4567-e89b-12d3-a456-426614174000' });
    expect(result.success).toBe(true);
  });

  it('should fail with an invalid uuid', () => {
    const result = terminateStaffSchema.safeParse({ staffId: 'not-a-uuid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid staff ID');
    }
  });
});
