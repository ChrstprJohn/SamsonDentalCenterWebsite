import { StaffProfileQueries } from '../../repositories';

export class GetStaffProfileUseCase {
  constructor(private readonly staffProfileQueries: StaffProfileQueries) {}

  /**
   * Retrieves a staff profile by ID.
   */
  async execute(staffId: string) {
    if (!staffId) {
      throw new Error('Staff ID is required to fetch staff profile.');
    }
    return this.staffProfileQueries.getProfileById(staffId);
  }
}
