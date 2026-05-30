import { describe, it, expect, vi } from 'vitest';
import { UserManagementQueries } from './user-management.queries';

describe('UserManagementQueries', () => {
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

    const queries = new UserManagementQueries(mockSupabase);
    const result = await queries.getAllUsers({ search: 'John' });

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

    const queries = new UserManagementQueries(mockSupabase);
    const result = await queries.getAllUsers({});

    expect(result.length).toBe(1);
  });
});
