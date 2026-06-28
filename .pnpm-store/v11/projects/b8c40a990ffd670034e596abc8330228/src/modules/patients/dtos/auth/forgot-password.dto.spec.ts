import { describe, it, expect } from 'vitest';
import { forgotPasswordSchema } from './forgot-password.dto';

describe('forgotPasswordSchema', () => {
  it('should pass with a valid email', () => {
    const validData = { email: 'test@example.com' };
    const result = forgotPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail with an invalid email', () => {
    const invalidData = { email: 'not-an-email' };
    const result = forgotPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please enter a valid email address');
    }
  });

  it('should fail if email is empty', () => {
    const invalidData = { email: '' };
    const result = forgotPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
