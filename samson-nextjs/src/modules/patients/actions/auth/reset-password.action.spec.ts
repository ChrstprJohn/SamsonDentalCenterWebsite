import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resetPasswordAction } from './reset-password.action';
import { createClient } from '@/shared/database/server';

// Mock dependencies
vi.mock('server-only', () => ({}));
vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn(),
}));

describe('resetPasswordAction', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: '123' } },
          error: null,
        }),
        updateUser: vi.fn().mockResolvedValue({
          data: { user: { id: '123' } },
          error: null,
        }),
        signOut: vi.fn().mockResolvedValue({
          error: null,
        }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  it('should return success when session exists and update succeeds', async () => {
    const response = await resetPasswordAction({ 
      password: 'newPassword123', 
      confirmPassword: 'newPassword123' 
    });

    expect(response.success).toBe(true);
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newPassword123' });
  });

  it('should return error if no valid session exists', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Not logged in'),
    });

    const response = await resetPasswordAction({ 
      password: 'newPassword123', 
      confirmPassword: 'newPassword123' 
    });

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toContain('Unauthorized');
    }
    expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it('should return error if update fails', async () => {
    mockSupabase.auth.updateUser.mockResolvedValueOnce({
      data: null,
      error: new Error('Password too weak'),
    });

    const response = await resetPasswordAction({ 
      password: 'newPassword123', 
      confirmPassword: 'newPassword123' 
    });

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe('Password too weak');
    }
  });

  it('should return validation error on invalid input', async () => {
    const response = await resetPasswordAction({ 
      password: 'short', 
      confirmPassword: 'short' 
    });

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe('Validation failed');
    }
    expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
  });
});
