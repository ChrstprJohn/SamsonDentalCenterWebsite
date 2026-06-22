import { describe, it, expect, vi } from 'vitest';
import { staffLoginCommand } from './staff-login.commands';
import { SupabaseClient } from '@supabase/supabase-js';

describe('staffLoginCommand', () => {
  it('should call signInWithPassword and return result', async () => {
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: 'staff_1' } },
          error: null,
        }),
      },
    } as unknown as SupabaseClient;

    const cmd = staffLoginCommand(mockSupabase);
    const result = await cmd({ email: 'staff@samson.com', password: 'password123' });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'staff@samson.com',
      password: 'password123',
    });
    expect(result).toEqual({ user: { id: 'staff_1' } });
  });

  it('should throw error when auth fails', async () => {
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Invalid credentials'),
        }),
      },
    } as unknown as SupabaseClient;

    const cmd = staffLoginCommand(mockSupabase);
    await expect(
      cmd({ email: 'staff@samson.com', password: 'password123' })
    ).rejects.toThrow('Invalid credentials');
  });
});
