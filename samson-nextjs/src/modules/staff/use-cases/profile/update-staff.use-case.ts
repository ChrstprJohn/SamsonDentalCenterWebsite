import { UpdateStaffDto } from '../../dtos';
import { StaffProfileCommands } from '../../repositories';

export class UpdateStaffUseCase {
    constructor(private readonly staffCommands: StaffProfileCommands) {}

    async execute(id: string, data: Partial<UpdateStaffDto>) {
        return await this.staffCommands.updateStaff(id, data);
    }
}
