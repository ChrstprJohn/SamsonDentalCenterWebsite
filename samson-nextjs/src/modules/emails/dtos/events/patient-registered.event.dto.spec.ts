import { describe, it, expect } from 'vitest';
import { patientRegisteredEventSchema } from './patient-registered.event.dto';

describe('patientRegisteredEventSchema', () => {
  it('should validate a correct patient registered event payload', () => {
    const validPayload = {
      email: 'patient@example.com',
      firstName: 'John',
      otpCode: '123456',
    };

    const result = patientRegisteredEventSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should reject invalid email formats', () => {
    const invalidPayload = {
      email: 'not-an-email',
      firstName: 'John',
      otpCode: '123456',
    };

    const result = patientRegisteredEventSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('should reject empty firstName', () => {
    const invalidPayload = {
      email: 'patient@example.com',
      firstName: '',
      otpCode: '123456',
    };

    const result = patientRegisteredEventSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('firstName');
    }
  });

  it('should reject otpCode that is too short', () => {
    const invalidPayload = {
      email: 'patient@example.com',
      firstName: 'John',
      otpCode: '12345',
    };

    const result = patientRegisteredEventSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('otpCode');
    }
  });
});
