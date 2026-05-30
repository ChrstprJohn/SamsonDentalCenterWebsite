import { describe, it, expect, vi } from 'vitest';
import { DeactivateUserUseCase } from './deactivate-user.use-case';

describe('DeactivateUserUseCase', () => {
  it('should execute successfully', async () => {
    const mockCommands = { deactivateUser: vi.fn().mockResolvedValue(true) } as any;
    const useCase = new DeactivateUserUseCase(mockCommands);
    const result = await useCase.execute({ userId: '123' });
    expect(result).toBe(true);
  });
});