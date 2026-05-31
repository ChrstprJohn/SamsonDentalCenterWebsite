import { StaffProfileQueries } from '../../repositories';
import { StaffProfileDto } from '../../dtos';

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

// Deprecated class for backwards compatibility
export class GetStaffProfileUseCase {
  constructor(private readonly staffProfileQueries: StaffProfileQueries) {}
  async execute(staffId: string) {
    return getStaffProfileUseCase((id) => this.staffProfileQueries.getProfileById(id))(staffId);
  }
}

