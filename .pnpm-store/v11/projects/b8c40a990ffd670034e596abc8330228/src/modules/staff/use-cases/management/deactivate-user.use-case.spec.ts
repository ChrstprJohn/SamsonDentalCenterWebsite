import { describe, it, expect, vi } from 'vitest';
import { deactivateUserUseCase } from './deactivate-user.use-case';

describe('DeactivateUserUseCase (Functional)', () => {
  it('should execute successfully', async () => {
    const mockDeactivateUser = vi.fn().mockResolvedValue(true);

    const execute = deactivateUserUseCase(mockDeactivateUser);
    const result = await execute({ userId: '123' });

    expect(result).toBe(true);
  });
});