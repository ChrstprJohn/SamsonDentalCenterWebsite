import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthenticatedUser, authorizeRole } from './auth.util';
import { createClient } from '@/shared/database/server';
import { UnauthorizedError } from '@/shared/errors';

// Mock server-only to prevent it from throwing in Vitest
vi.mock('server-only', () => ({}));

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn(),
}));

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws UnauthorizedError if no user is logged in', async () => {
    // Scenario: User attempts to access a protected route without a session
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) }
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    await expect(getAuthenticatedUser()).rejects.toThrow(UnauthorizedError);
  });

  it('returns the user if logged in', async () => {
    // Scenario: Valid session exists, system should return user data
    const mockUser = { id: '123' };
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const user = await getAuthenticatedUser();
    expect(user.id).toBe('123');
  });

  it('authorizes user if role matches', async () => {
    // Scenario: User has the exact required role for the action
    const mockUser = { id: '123', user_metadata: { role: 'ADMIN' } };
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    await expect(authorizeRole('ADMIN')).resolves.toBeDefined();
  });

  it('throws UnauthorizedError if role does not match', async () => {
    // Scenario: User is logged in but lacks the required permission level
    const mockUser = { id: '123', user_metadata: { role: 'PATIENT' } };
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    await expect(authorizeRole('ADMIN')).rejects.toThrow(UnauthorizedError);
  });
});
