import { UpdateStaffDto, StaffProfileDto } from '../../dtos';
import { StaffProfileCommands } from '../../repositories';

export const updateStaffUseCase = (
    updateStaff: (id: string, data: Partial<UpdateStaffDto>) => Promise<StaffProfileDto>
) => {
    return async (id: string, data: Partial<UpdateStaffDto>) => {
        return await updateStaff(id, data);
    };
};

// Deprecated class for backwards compatibility
export class UpdateStaffUseCase {
    constructor(private readonly staffCommands: StaffProfileCommands) {}
    async execute(id: string, data: Partial<UpdateStaffDto>) {
        return updateStaffUseCase((sid, d) => this.staffCommands.updateStaff(sid, d))(id, data);
    }
}

