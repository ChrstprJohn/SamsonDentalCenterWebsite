import { describe, it, expect, vi } from 'vitest';
import { createDependentAction } from './create-dependent.action';

vi.mock('@/shared/auth/auth.util', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174000', role: 'PATIENT' }),
}));
vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));
vi.mock('../../repositories', () => ({
  addDependentCommand: () => vi.fn().mockResolvedValue({ id: '123' }),
  PatientDependentsCommands: class {
    addDependent = vi.fn().mockResolvedValue({ id: '123' });
  }
}));


describe('createDependentAction', () => {
  it('should create dependent and return success', async () => {
    const result = await createDependentAction({
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '2010-05-15',
      relationship: 'CHILD',
    });
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('123');
  });
});