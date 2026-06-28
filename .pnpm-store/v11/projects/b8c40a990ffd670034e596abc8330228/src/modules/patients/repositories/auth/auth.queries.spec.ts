import { describe, it, expect, vi } from 'vitest';
import { checkUserExistsQuery } from './auth.queries';

describe('checkUserExistsQuery', () => {
  it('returns true if the user exists', async () => {
    const mockSupabaseAdmin = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: '123' } }),
    };

    const query = checkUserExistsQuery(mockSupabaseAdmin as any);
    const result = await query('test@example.com');

    expect(result).toBe(true);
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('users');
    expect(mockSupabaseAdmin.select).toHaveBeenCalledWith('id');
    expect(mockSupabaseAdmin.eq).toHaveBeenCalledWith('email', 'test@example.com');
  });

  it('returns false if the user does not exist', async () => {
    const mockSupabaseAdmin = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }), // User not found
    };

    const query = checkUserExistsQuery(mockSupabaseAdmin as any);
    const result = await query('test@example.com');

    expect(result).toBe(false);
  });
});
