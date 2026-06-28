import { describe, it, expect } from 'vitest';
import { loginSchema } from './login.dto';

describe('loginSchema', () => {
  it('should validate a correct login payload successfully', () => {
    const payload = {
      email: 'john.doe@example.com',
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email formatting', () => {
    const payload = {
      email: 'john.doe',
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
