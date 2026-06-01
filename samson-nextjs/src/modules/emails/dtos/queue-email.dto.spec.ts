import { describe, it, expect } from 'vitest';
import { queueEmailSchema } from './queue-email.dto';

describe('QueueEmail DTO', () => {
  it('should validate a valid email payload', () => {
    const validData = {
      recipient: 'test@example.com',
      subject: 'Welcome',
      templateName: 'signup_otp',
      payload: { firstName: 'John', otpCode: '123456' },
    };
    expect(() => queueEmailSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid recipient email', () => {
    const invalidData = {
      recipient: 'not-an-email',
      subject: 'Welcome',
      templateName: 'signup_otp',
      payload: { firstName: 'John', otpCode: '123456' },
    };
    expect(() => queueEmailSchema.parse(invalidData)).toThrow();
  });
});
