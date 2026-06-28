import { describe, it, expect } from 'vitest';
import { staffLoginSchema } from './staff-login.dto';

describe('staffLoginSchema', () => {
  it('should validate correct inputs', () => {
    const result = staffLoginSchema.safeParse({
      email: 'staff@samson.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should fail with invalid email', () => {
    const result = staffLoginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should fail with short password', () => {
    const result = staffLoginSchema.safeParse({
      email: 'staff@samson.com',
      password: '123',
    });
    expect(result.success).toBe(false);
  });
});
