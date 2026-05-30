import { describe, it, expect, vi } from 'vitest';
import { getUserDependentsAction } from './get-user-dependents.action';

vi.mock('@/shared/auth/auth.util', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ id: 'user1', role: 'PATIENT' }),
}));
vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));
vi.mock('../../repositories', () => ({
  PatientDependentsQueries: class {
    getDependentsByPatientId = vi.fn().mockResolvedValue([{ id: 'dep1' }]);
  }
}));

describe('getUserDependentsAction', () => {
  it('should get dependents and return success', async () => {
    const result = await getUserDependentsAction('123e4567-e89b-12d3-a456-426614174000');
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
  });
});