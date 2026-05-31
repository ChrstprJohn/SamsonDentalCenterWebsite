import { describe, it, expect, vi } from 'vitest';
import { deactivateUserCommand } from './user-management.commands';

describe('UserManagementCommands (Functional)', () => {
  it('should deactivate user', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    } as any;

    const deactivateUser = deactivateUserCommand(mockSupabase);
    const result = await deactivateUser('123', 'Testing');

    expect(result).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });
});

