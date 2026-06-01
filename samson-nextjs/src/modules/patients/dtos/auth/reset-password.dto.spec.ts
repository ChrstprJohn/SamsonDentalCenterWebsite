import { describe, it, expect } from 'vitest';
import { resetPasswordSchema } from './reset-password.dto';

describe('resetPasswordSchema', () => {
  it('should pass with matching passwords of sufficient length', () => {
    const validData = { password: 'password123', confirmPassword: 'password123' };
    const result = resetPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if password is less than 8 characters', () => {
    const invalidData = { password: 'short', confirmPassword: 'short' };
    const result = resetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
    }
  });

  it('should fail if passwords do not match', () => {
    const invalidData = { password: 'password123', confirmPassword: 'password321' };
    const result = resetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords don't match");
      expect(result.error.issues[0].path[0]).toBe('confirmPassword');
    }
  });
});
