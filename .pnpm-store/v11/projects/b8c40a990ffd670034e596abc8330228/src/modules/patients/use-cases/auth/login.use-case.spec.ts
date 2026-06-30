import { describe, it, expect, vi } from 'vitest';
import { loginUseCase } from './login.use-case';
import { DomainError } from '@/shared/errors';

describe('loginUseCase', () => {
  it('throws DomainError if password is not provided', async () => {
    const mockCommand = vi.fn();
    const useCase = loginUseCase(mockCommand);

    await expect(useCase({ email: 'test@example.com', password: '' }))
      .rejects.toThrowError(new DomainError('Password is required'));
    
    expect(mockCommand).not.toHaveBeenCalled();
  });

  it('calls loginCommand and returns data on success', async () => {
    const mockCommand = vi.fn().mockResolvedValue({ user: { id: '123' } });
    const useCase = loginUseCase(mockCommand);

    const result = await useCase({ email: 'test@example.com', password: 'password123' });

    expect(result).toEqual({ user: { id: '123' } });
    expect(mockCommand).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
  });

  it('wraps command errors in a DomainError', async () => {
    const mockCommand = vi.fn().mockRejectedValue(new Error('Invalid login credentials'));
    const useCase = loginUseCase(mockCommand);

    await expect(useCase({ email: 'test@example.com', password: 'password123' }))
      .rejects.toThrowError(new DomainError('Invalid login credentials'));
  });

  it('blocks staff roles from logging in', async () => {
    const staffRoles = ['ADMIN', 'SECRETARY', 'DOCTOR'];
    for (const role of staffRoles) {
      const mockCommand = vi.fn().mockResolvedValue({
        user: { id: '123', user_metadata: { role } }
      });
      const useCase = loginUseCase(mockCommand);

      await expect(useCase({ email: 'test@example.com', password: 'password123' }))
        .rejects.toThrowError(new DomainError('Access denied: staff members cannot log in to the patient portal'));
    }
  });
});
