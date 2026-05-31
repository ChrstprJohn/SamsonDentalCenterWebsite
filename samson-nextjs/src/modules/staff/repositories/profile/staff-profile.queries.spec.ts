import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfileByIdQuery } from './staff-profile.queries';
import { NotFoundError } from '@/shared/errors';

describe('StaffProfileQueries (Functional)', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
  });

  it('should throw NotFoundError if staff profile does not exist', async () => {
    // 1. Arrange
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    // 2 & 3. Act & Assert
    const getProfileById = getProfileByIdQuery(mockSupabase as any);
    await expect(getProfileById('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow(NotFoundError);
  });

  it('should return staff data if found', async () => {
    // 1. Arrange
    const mockStaff = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john@samson.com',
      first_name: 'John',
      last_name: 'Smith',
      role: 'SECRETARY',
    };
    mockSupabase.single.mockResolvedValue({ data: mockStaff, error: null });

    // 2. Act
    const getProfileById = getProfileByIdQuery(mockSupabase as any);
    const result = await getProfileById('123e4567-e89b-12d3-a456-426614174000');

    // 3. Assert
    expect(result).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john@samson.com',
      firstName: 'John',
      middleName: null,
      lastName: 'Smith',
      suffix: null,
      phoneNumber: null,
      role: 'SECRETARY',
      createdAt: undefined,
      updatedAt: undefined,
    });
    expect(mockSupabase.from).toHaveBeenCalledWith('staff');
  });
});

