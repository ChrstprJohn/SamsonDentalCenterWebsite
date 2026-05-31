import { describe, it, expect } from 'vitest';
import { loginSchema } from './login.dto';

describe('loginSchema', () => {
  it('should validate a correct login payload successfully', () => {
    const payload = {
      email: 'john.doe@example.com',
      acceptTerms: true,
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should reject login payload if terms are unchecked', () => {
    const payload = {
      email: 'john.doe@example.com',
      acceptTerms: false,
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
