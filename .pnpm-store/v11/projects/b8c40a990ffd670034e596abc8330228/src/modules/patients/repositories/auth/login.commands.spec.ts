import { describe, it, expect, vi } from 'vitest';
import { loginCommand } from './login.commands';

describe('loginCommand', () => {
  it('calls signInWithPassword and returns data on success', async () => {
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
      },
    };

    const command = loginCommand(mockSupabase as any);
    const result = await command({ email: 'test@example.com', password: 'password123' });

    expect(result).toEqual({ user: { id: '1' } });
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('throws an error if signInWithPassword fails', async () => {
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } }),
      },
    };

    const command = loginCommand(mockSupabase as any);

    await expect(command({ email: 'test@example.com', password: 'password123' }))
      .rejects.toThrowError('Invalid credentials');
  });
});
