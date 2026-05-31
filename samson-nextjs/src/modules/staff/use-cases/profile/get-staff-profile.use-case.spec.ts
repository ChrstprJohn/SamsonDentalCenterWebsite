import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStaffProfileUseCase } from './get-staff-profile.use-case';

describe('GetStaffProfileUseCase (Functional)', () => {
  let mockGetProfileById: any;

  beforeEach(() => {
    mockGetProfileById = vi.fn();
  });

  it('should successfully retrieve staff profile for a valid ID', async () => {
    const mockProfile = { id: 'staff-123', firstName: 'John', lastName: 'Doe' };
    mockGetProfileById.mockResolvedValueOnce(mockProfile);

    const execute = getStaffProfileUseCase(mockGetProfileById);
    const result = await execute('staff-123');

    expect(result).toEqual(mockProfile);
    expect(mockGetProfileById).toHaveBeenCalledWith('staff-123');
  });

  it('should throw an error if staff ID is empty or missing', async () => {
    const execute = getStaffProfileUseCase(mockGetProfileById);
    await expect(execute('')).rejects.toThrow(
      'Staff ID is required to fetch staff profile.'
    );
    expect(mockGetProfileById).not.toHaveBeenCalled();
  });
});

