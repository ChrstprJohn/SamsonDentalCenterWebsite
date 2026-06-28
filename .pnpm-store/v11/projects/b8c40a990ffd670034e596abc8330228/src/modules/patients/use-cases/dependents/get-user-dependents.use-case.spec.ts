import { describe, it, expect, vi } from 'vitest';
import { getUserDependentsUseCase } from './get-user-dependents.use-case';

describe('GetUserDependentsUseCase (Functional)', () => {
  it('should execute successfully', async () => {
    const mockGetDependentsByPatientId = vi.fn().mockResolvedValue([{ id: '123' }]);

    const execute = getUserDependentsUseCase(mockGetDependentsByPatientId);
    const result = await execute('123e4567-e89b-12d3-a456-426614174000');

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('123');
  });
});