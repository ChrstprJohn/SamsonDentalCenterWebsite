import { describe, it, expect, vi } from 'vitest';
import { verifyOtpUseCase } from './verify-otp.use-case';
import { DomainError } from '@/shared/errors';

describe('verifyOtpUseCase', () => {
  it('throws DomainError if user not found during recovery', async () => {
    const deps = {
      checkUserExists: vi.fn().mockResolvedValue(false),
      verifyOtp: vi.fn(),
    };
    const useCase = verifyOtpUseCase(deps);

    await expect(useCase('test@example.com', '123456', 'recovery'))
      .rejects.toThrowError(new DomainError('User not found'));
      
    expect(deps.checkUserExists).toHaveBeenCalledWith('test@example.com');
    expect(deps.verifyOtp).not.toHaveBeenCalled();
  });

  it('throws DomainError if OTP verification fails', async () => {
    const deps = {
      checkUserExists: vi.fn().mockResolvedValue(true),
      verifyOtp: vi.fn().mockRejectedValue(new Error('Invalid token')),
    };
    const useCase = verifyOtpUseCase(deps);

    await expect(useCase('test@example.com', '123456', 'recovery'))
      .rejects.toThrowError(new DomainError('Invalid token'));
  });

  it('throws DomainError if recovery session is not established', async () => {
    const deps = {
      checkUserExists: vi.fn().mockResolvedValue(true),
      verifyOtp: vi.fn().mockResolvedValue({ user: { email: 'test@example.com' }, session: null }),
    };
    const useCase = verifyOtpUseCase(deps);

    await expect(useCase('test@example.com', '123456', 'recovery'))
      .rejects.toThrowError(new DomainError('Failed to establish recovery session'));
  });

  it('throws DomainError if email identity mismatch', async () => {
    const deps = {
      checkUserExists: vi.fn().mockResolvedValue(true),
      verifyOtp: vi.fn().mockResolvedValue({ user: { email: 'other@example.com' }, session: { id: 's1' } }),
    };
    const useCase = verifyOtpUseCase(deps);

    await expect(useCase('test@example.com', '123456', 'recovery'))
      .rejects.toThrowError(new DomainError('Identity verification failed: Email mismatch'));
  });

  it('returns session data on success', async () => {
    const sessionData = { user: { email: 'test@example.com' }, session: { id: 's1' } };
    const deps = {
      checkUserExists: vi.fn().mockResolvedValue(true),
      verifyOtp: vi.fn().mockResolvedValue(sessionData),
    };
    const useCase = verifyOtpUseCase(deps);

    const result = await useCase('test@example.com', '123456', 'recovery');
    
    expect(result).toEqual(sessionData);
  });
});
