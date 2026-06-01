import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onPatientRegisteredSubscriber } from './on-patient-registered.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { z } from 'zod';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');

describe('onPatientRegisteredSubscriber', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates DTO payload and calls ResendService', async () => {
    // Arrange
    const validPayload = {
      email: 'test@example.com',
      firstName: 'John',
      otpCode: '123456',
    };

    // Act
    await onPatientRegisteredSubscriber.handle(validPayload);

    // Assert
    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Your Samson Dental Center Verification Code',
      'signup_otp',
      { firstName: 'John', otpCode: '123456' }
    );
  });

  it('throws ZodError if payload is invalid (missing fields)', async () => {
    // Arrange
    const invalidPayload = {
      email: 'test@example.com',
      // missing firstName and otpCode
    };

    // Act & Assert
    await expect(onPatientRegisteredSubscriber.handle(invalidPayload)).rejects.toThrow(z.ZodError);
    expect(ResendService.sendTemplatedEmail).not.toHaveBeenCalled();
  });

  it('throws ZodError if email is malformed', async () => {
    // Arrange
    const invalidPayload = {
      email: 'not-an-email',
      firstName: 'John',
      otpCode: '123456',
    };

    // Act & Assert
    await expect(onPatientRegisteredSubscriber.handle(invalidPayload)).rejects.toThrow(z.ZodError);
  });
});
