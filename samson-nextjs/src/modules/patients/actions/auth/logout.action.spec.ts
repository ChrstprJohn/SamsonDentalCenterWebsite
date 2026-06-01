import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logoutAction } from './logout.action';
import { createClient } from '@/shared/database/server';

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn(),
}));

describe('logoutAction Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success: true when Supabase signOut is successful', async () => {
    const mockSupabase = {
      auth: {
        signOut: vi.fn().mockResolvedValue({
          error: null,
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await logoutAction();

    expect(response.success).toBe(true);
    expect(mockSupabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it('returns success: false with an error message when Supabase signOut fails', async () => {
    const mockSupabase = {
      auth: {
        signOut: vi.fn().mockResolvedValue({
          error: { message: 'Failed to clear session' },
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await logoutAction();

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe('Failed to clear session');
    }
    expect(mockSupabase.auth.signOut).toHaveBeenCalledOnce();
  });
});
