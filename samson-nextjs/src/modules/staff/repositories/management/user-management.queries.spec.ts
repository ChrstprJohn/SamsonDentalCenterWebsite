import { describe, it, expect, vi } from 'vitest';
import { getAllUsersQuery } from './user-management.queries';

describe('UserManagementQueries (Functional)', () => {
  it('should get all users', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      or: vi.fn().mockResolvedValue({
        data: [{ id: '123', first_name: 'John', last_name: 'Doe' }],
        error: null,
      }),
    } as any;

    const getAllUsers = getAllUsersQuery(mockSupabase);
    const result = await getAllUsers({ search: 'John' });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('123');
  });

  it('should get all users without search', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [{ id: '123', first_name: 'John', last_name: 'Doe' }],
        error: null,
      }),
    } as any;

    const getAllUsers = getAllUsersQuery(mockSupabase);
    const result = await getAllUsers({});

    expect(result.length).toBe(1);
  });
});

