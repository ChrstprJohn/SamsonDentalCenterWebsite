import { UpdateStaffDto } from '../dtos/update-staff.dto';
import { StaffProfileCommands } from '../repositories/staff-profile.commands';

export class UpdateStaffUseCase {
    constructor(private readonly staffCommands: StaffProfileCommands) {}

    async execute(id: string, data: Partial<UpdateStaffDto>) {
        return await this.staffCommands.updateStaff(id, data);
    }
}
