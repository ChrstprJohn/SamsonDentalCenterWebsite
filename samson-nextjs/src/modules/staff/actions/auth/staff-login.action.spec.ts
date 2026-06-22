import { describe, it, expect, vi, beforeEach } from 'vitest';
import { staffLoginAction } from './staff-login.action';
import { createClient } from '@/shared/database/server';

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn(),
}));

describe('staffLoginAction Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success: false with validation errors if inputs are invalid', async () => {
    const invalidInput = {
      email: 'invalid-email',
      password: '123',
    };

    const response = await staffLoginAction(invalidInput as any);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe('Validation failed');
      expect(response.fieldErrors?.email).toBeDefined();
    }
  });

  it('returns success: false if role validation rejects PATIENT user', async () => {
    const input = {
      email: 'patient@samson.com',
      password: 'password123',
    };

    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: {
              email: 'patient@samson.com',
              user_metadata: { role: 'PATIENT' },
            },
          },
          error: null,
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await staffLoginAction(input);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe('Access denied: patients cannot log in to the staff portal');
      expect(response.fieldErrors?.password).toContain('Access denied: patients cannot log in to the staff portal');
    }
  });

  it('returns success: true and data when login is successful for staff', async () => {
    const input = {
      email: 'admin@samson.com',
      password: 'password123',
    };

    const mockSession = {
      user: {
        email: 'admin@samson.com',
        user_metadata: { role: 'ADMIN' },
      },
    };
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await staffLoginAction(input);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(mockSession);
    }
  });
});
