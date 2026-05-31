import { describe, it, expect, vi } from 'vitest';
import { createDependentUseCase } from './create-dependent.use-case';

describe('CreateDependentUseCase (Functional)', () => {
  it('should execute successfully', async () => {
    const mockAddDependent = vi.fn().mockResolvedValue({ id: '123' });

    const execute = createDependentUseCase(mockAddDependent);
    const result = await execute({
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '2010-05-15',
      relationship: 'CHILD',
    });
    expect(result.id).toBe('123');
  });
});