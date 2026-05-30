import { describe, it, expect, vi } from 'vitest';
import { GetAllUsersUseCase } from './get-all-users.use-case';

describe('GetAllUsersUseCase', () => {
  it('should execute successfully', async () => {
    const mockQueries = { getAllUsers: vi.fn().mockResolvedValue([{ id: '123' }]) } as any;
    const useCase = new GetAllUsersUseCase(mockQueries);
    const result = await useCase.execute({});
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('123');
  });
});