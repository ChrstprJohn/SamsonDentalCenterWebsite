import { describe, it, expect, vi } from 'vitest';
import { GetUserDependentsUseCase } from './get-user-dependents.use-case';

describe('GetUserDependentsUseCase', () => {
  it('should execute successfully', async () => {
    const mockQueries = { getDependentsByPatientId: vi.fn().mockResolvedValue([{ id: '123' }]) } as any;
    const useCase = new GetUserDependentsUseCase(mockQueries);
    const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('123');
  });
});