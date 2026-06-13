import { describe, it, expect, vi } from 'vitest';
import { getAllUsersAction } from './get-all-users.action';

vi.mock('@/shared/auth/auth.util', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ id: 'user1', role: 'ADMIN' }),
  authorizeRole: vi.fn().mockResolvedValue(true),
}));
vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));
vi.mock('../../repositories/exports', () => ({
  getAllUsersQuery: () => vi.fn().mockResolvedValue([{ id: 'user1' }]),
  UserManagementQueries: class {
    getAllUsers = vi.fn().mockResolvedValue([{ id: 'user1' }]);
  }
}));


describe('getAllUsersAction', () => {
  it('should get users and return success', async () => {
    const result = await getAllUsersAction({});
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
  });
});