import { describe, it, expect, vi } from 'vitest';
import { deactivateUserAction } from './deactivate-user.action';

vi.mock('@/shared/auth/auth.util', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ id: 'user1', role: 'ADMIN' }),
  authorizeRole: vi.fn().mockResolvedValue(true),
}));
vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));
vi.mock('../../repositories', () => ({
  deactivateUserCommand: () => vi.fn().mockResolvedValue(true),
  UserManagementCommands: class {
    deactivateUser = vi.fn().mockResolvedValue(true);
  }
}));


describe('deactivateUserAction', () => {
  it('should deactivate user and return success', async () => {
    const result = await deactivateUserAction({ userId: '123e4567-e89b-12d3-a456-426614174000' });
    expect(result.success).toBe(true);
  });
});