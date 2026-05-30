import { describe, it, expect, vi } from 'vitest';
import { UserManagementCommands } from './user-management.commands';

describe('UserManagementCommands', () => {
  it('should deactivate user', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    } as any;

    const commands = new UserManagementCommands(mockSupabase);
    const result = await commands.deactivateUser('123', 'Testing');

    expect(result).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });
});
