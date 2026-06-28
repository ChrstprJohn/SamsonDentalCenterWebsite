import { describe, it, expect, vi } from 'vitest';
import { resetPasswordUseCase } from './reset-password.use-case';
import { DomainError } from '@/shared/errors';

describe('resetPasswordUseCase', () => {
  it('updates the password if a session exists and signs out', async () => {
    const deps = {
      getSessionUser: vi.fn().mockResolvedValue({ id: '123' }),
      updatePassword: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = resetPasswordUseCase(deps);

    await useCase({ password: 'newPassword123', confirmPassword: 'newPassword123' });

    expect(deps.getSessionUser).toHaveBeenCalled();
    expect(deps.updatePassword).toHaveBeenCalledWith({ password: 'newPassword123', confirmPassword: 'newPassword123' });
    expect(deps.signOut).toHaveBeenCalled();
  });

  it('throws DomainError("Unauthorized") if no session exists', async () => {
    const deps = {
      getSessionUser: vi.fn().mockRejectedValue(new Error('Unauthorized')),
      updatePassword: vi.fn(),
      signOut: vi.fn(),
    };
    const useCase = resetPasswordUseCase(deps);

    await expect(useCase({ password: 'newPassword123', confirmPassword: 'newPassword123' }))
      .rejects.toThrowError(new DomainError('Unauthorized. Please restart the password reset process.'));
    
    expect(deps.updatePassword).not.toHaveBeenCalled();
  });

  it('throws DomainError if password update fails', async () => {
    const deps = {
      getSessionUser: vi.fn().mockResolvedValue({ id: '123' }),
      updatePassword: vi.fn().mockRejectedValue(new Error('Password too weak')),
      signOut: vi.fn(),
    };
    const useCase = resetPasswordUseCase(deps);

    await expect(useCase({ password: 'newPassword123', confirmPassword: 'newPassword123' }))
      .rejects.toThrowError(new DomainError('Password too weak'));
  });
});
