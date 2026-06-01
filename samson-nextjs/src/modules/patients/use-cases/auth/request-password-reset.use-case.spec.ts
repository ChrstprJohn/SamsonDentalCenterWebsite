import { describe, it, expect, vi } from 'vitest';
import { requestPasswordResetUseCase } from './request-password-reset.use-case';
import { DomainError } from '@/shared/errors';

describe('requestPasswordResetUseCase', () => {
  it('calls the command and then triggers background workers', async () => {
    const deps = {
      requestPasswordResetCommand: vi.fn().mockResolvedValue(undefined),
      triggerBackgroundWorkers: vi.fn(),
    };
    const useCase = requestPasswordResetUseCase(deps);

    await useCase('test@example.com');

    expect(deps.requestPasswordResetCommand).toHaveBeenCalledWith('test@example.com');
    expect(deps.triggerBackgroundWorkers).toHaveBeenCalled();
  });

  it('throws a DomainError if the command fails', async () => {
    const deps = {
      requestPasswordResetCommand: vi.fn().mockRejectedValue(new Error('Failed to request')),
      triggerBackgroundWorkers: vi.fn(),
    };
    const useCase = requestPasswordResetUseCase(deps);

    await expect(useCase('test@example.com')).rejects.toThrowError(new DomainError('Failed to request'));
    expect(deps.triggerBackgroundWorkers).not.toHaveBeenCalled();
  });
});
