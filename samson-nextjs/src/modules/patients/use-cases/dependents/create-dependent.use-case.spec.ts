import { describe, it, expect, vi } from 'vitest';
import { CreateDependentUseCase } from './create-dependent.use-case';

describe('CreateDependentUseCase', () => {
  it('should execute successfully', async () => {
    const mockCommands = { addDependent: vi.fn().mockResolvedValue({ id: '123' }) } as any;
    const useCase = new CreateDependentUseCase(mockCommands);
    const result = await useCase.execute({
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '2010-05-15',
      relationship: 'CHILD',
    });
    expect(result.id).toBe('123');
  });
});