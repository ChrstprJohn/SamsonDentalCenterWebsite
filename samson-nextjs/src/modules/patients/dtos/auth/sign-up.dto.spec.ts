import { describe, it, expect } from 'vitest';
import { signUpSchema } from './sign-up.dto';

describe('signUpSchema', () => {
  it('should validate a correct signup payload successfully', () => {
    const payload = {
      firstName: 'John',
      middleName: 'Robert',
      lastName: 'Doe',
      suffix: 'Jr.',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      acceptTerms: true,
    };
    const result = signUpSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should reject payload with invalid email format', () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      acceptTerms: true,
    };
    const result = signUpSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject payload with non-E.164 phone number', () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '12345',
      dateOfBirth: '1990-01-01',
      acceptTerms: true,
    };
    const result = signUpSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject payload if terms are not accepted', () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      acceptTerms: false,
    };
    const result = signUpSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
