import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffProfileQueries } from './staff-profile.queries';
import { NotFoundError } from '@/shared/errors';

describe('StaffProfileQueries', () => {
  let mockSupabase: any;
  let queries: StaffProfileQueries;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    queries = new StaffProfileQueries(mockSupabase as any);
  });

  it('should throw NotFoundError if staff profile does not exist', async () => {
    // 1. Arrange
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    // 2 & 3. Act & Assert
    await expect(queries.getProfileById('123')).rejects.toThrow(NotFoundError);
  });

  it('should return staff data if found', async () => {
    // 1. Arrange
    const mockStaff = { id: '123', first_name: 'John' };
    mockSupabase.single.mockResolvedValue({ data: mockStaff, error: null });

    // 2. Act
    const result = await queries.getProfileById('123');

    // 3. Assert
    expect(result).toEqual(mockStaff);
    expect(mockSupabase.from).toHaveBeenCalledWith('staff');
  });
});