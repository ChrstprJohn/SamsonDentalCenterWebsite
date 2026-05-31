import { CreateStaffDto, StaffProfileDto } from '../../dtos';
import { StaffProfileCommands } from '../../repositories';

export const createStaffUseCase = (
    createStaff: (userId: string, data: CreateStaffDto) => Promise<StaffProfileDto>
) => {
    return async (userId: string, data: CreateStaffDto) => {
        return await createStaff(userId, data);
    };
};

// Deprecated class for backwards compatibility
export class CreateStaffUseCase {
    constructor(private readonly staffCommands: StaffProfileCommands) {}
    async execute(userId: string, data: CreateStaffDto) {
        return createStaffUseCase((uid, d) => this.staffCommands.createStaff(uid, d))(userId, data);
    }
}

