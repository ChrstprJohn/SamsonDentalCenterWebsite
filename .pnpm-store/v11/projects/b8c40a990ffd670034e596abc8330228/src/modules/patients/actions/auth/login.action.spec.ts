import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAction } from './login.action';
import { createClient } from '@/shared/database/server';

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn(),
}));

describe('loginAction Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success: false with validation errors if inputs are invalid', async () => {
    const invalidInput = {
      email: 'invalid-email',
      password: '123',
    };

    const response = await loginAction(invalidInput as any);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe('Validation failed');
      expect(response.fieldErrors).toBeDefined();
      expect(response.fieldErrors?.email).toBeDefined();
    }
  });

  it('returns success: false if password is not provided', async () => {
    const input = {
      email: 'john.doe@example.com',
      password: '',
    };

    const response = await loginAction(input);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe('Password is required');
      expect(response.fieldErrors?.password).toContain('Password is required');
    }
  });

  it('returns success: false if Supabase authentication fails', async () => {
    const input = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid login credentials' },
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await loginAction(input);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe('Invalid login credentials');
      expect(response.fieldErrors?.password).toContain('Invalid email or password');
    }
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: input.email,
      password: input.password,
    });
  });

  it('returns success: true and user session data when login is successful', async () => {
    const input = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const mockSession = { user: { email: 'john.doe@example.com' }, session: { access_token: 'token' } };
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await loginAction(input);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(mockSession);
    }
  });
});
