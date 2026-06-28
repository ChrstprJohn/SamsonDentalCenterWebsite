
import { StaffProfileDto } from '../../dtos/exports';

export const getStaffProfileUseCase = (
  getProfileById: (staffId: string) => Promise<StaffProfileDto>
) => {
  return async (staffId: string) => {
    if (!staffId) {
      throw new Error('Staff ID is required to fetch staff profile.');
    }
    return getProfileById(staffId);
  };
};
