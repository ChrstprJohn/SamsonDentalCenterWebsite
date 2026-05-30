import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetStaffProfileUseCase } from './get-staff-profile.use-case';
import { StaffProfileQueries } from '../../repositories/profile/staff-profile.queries';

describe('GetStaffProfileUseCase', () => {
  let useCase: GetStaffProfileUseCase;
  let mockQueries: any;

  beforeEach(() => {
    mockQueries = {
      getProfileById: vi.fn(),
    };

    useCase = new GetStaffProfileUseCase(
      mockQueries as unknown as StaffProfileQueries
    );
  });

  it('should successfully retrieve staff profile for a valid ID', async () => {
    const mockProfile = { id: 'staff-123', first_name: 'John', last_name: 'Doe' };
    mockQueries.getProfileById.mockResolvedValueOnce(mockProfile);

    const result = await useCase.execute('staff-123');

    expect(result).toEqual(mockProfile);
    expect(mockQueries.getProfileById).toHaveBeenCalledWith('staff-123');
  });

  it('should throw an error if staff ID is empty or missing', async () => {
    await expect(useCase.execute('')).rejects.toThrow(
      'Staff ID is required to fetch staff profile.'
    );
    expect(mockQueries.getProfileById).not.toHaveBeenCalled();
  });
});
