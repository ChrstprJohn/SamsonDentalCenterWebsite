import { describe, it, expect, vi } from 'vitest';
import { resendOtpUseCase } from './resend-otp.use-case';
import { DomainError } from '@/shared/errors';

describe('resendOtpUseCase', () => {
  it('requests password reset and triggers background workers on recovery', async () => {
    const deps = {
      requestPasswordReset: vi.fn().mockResolvedValue(undefined),
      resendAuthOtp: vi.fn(),
      triggerBackgroundWorkers: vi.fn(),
    };
    const useCase = resendOtpUseCase(deps);

    await useCase('test@example.com', 'recovery');

    expect(deps.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    expect(deps.triggerBackgroundWorkers).toHaveBeenCalled();
    expect(deps.resendAuthOtp).not.toHaveBeenCalled();
  });

  it('calls resendAuthOtp directly on signup type', async () => {
    const deps = {
      requestPasswordReset: vi.fn(),
      resendAuthOtp: vi.fn().mockResolvedValue(undefined),
      triggerBackgroundWorkers: vi.fn(),
    };
    const useCase = resendOtpUseCase(deps);

    await useCase('test@example.com', 'signup');

    expect(deps.resendAuthOtp).toHaveBeenCalledWith('test@example.com', 'signup');
    expect(deps.requestPasswordReset).not.toHaveBeenCalled();
    expect(deps.triggerBackgroundWorkers).not.toHaveBeenCalled();
  });

  it('throws DomainError if any dependency fails', async () => {
    const deps = {
      requestPasswordReset: vi.fn(),
      resendAuthOtp: vi.fn().mockRejectedValue(new Error('Rate limit exceeded')),
      triggerBackgroundWorkers: vi.fn(),
    };
    const useCase = resendOtpUseCase(deps);

    await expect(useCase('test@example.com', 'signup'))
      .rejects.toThrowError(new DomainError('Rate limit exceeded'));
  });
});
