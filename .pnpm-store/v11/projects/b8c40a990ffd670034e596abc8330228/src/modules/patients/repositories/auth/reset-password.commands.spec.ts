import { describe, it, expect, vi } from 'vitest';
import { getSessionUserQuery, updatePasswordCommand } from './reset-password.commands';

describe('reset-password.commands', () => {
  describe('getSessionUserQuery', () => {
    it('returns the user if a valid session exists', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
        },
      };

      const query = getSessionUserQuery(mockSupabase as any);
      const result = await query();

      expect(result).toEqual({ id: '123' });
    });

    it('throws Unauthorized if getUser fails or returns no user', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Session missing') }),
        },
      };

      const query = getSessionUserQuery(mockSupabase as any);

      await expect(query()).rejects.toThrowError('Unauthorized');
    });
  });

  describe('updatePasswordCommand', () => {
    it('calls updateUser with the new password', async () => {
      const mockSupabase = {
        auth: {
          updateUser: vi.fn().mockResolvedValue({ error: null }),
        },
      };

      const command = updatePasswordCommand(mockSupabase as any);
      await command({ password: 'newPassword123', confirmPassword: 'newPassword123' });

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newPassword123' });
    });

    it('throws an error if updateUser fails', async () => {
      const mockSupabase = {
        auth: {
          updateUser: vi.fn().mockResolvedValue({ error: { message: 'Password too weak' } }),
        },
      };

      const command = updatePasswordCommand(mockSupabase as any);

      await expect(command({ password: 'newPassword123', confirmPassword: 'newPassword123' }))
        .rejects.toThrowError('Password too weak');
    });
  });
});
