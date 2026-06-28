import { describe, it, expect, vi } from 'vitest';
import { getAllUsersUseCase } from './get-all-users.use-case';

describe('GetAllUsersUseCase (Functional)', () => {
  it('should execute successfully', async () => {
    const mockGetAllUsers = vi.fn().mockResolvedValue([{ id: '123' }]);

    const execute = getAllUsersUseCase(mockGetAllUsers);
    const result = await execute({});

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('123');
  });
});