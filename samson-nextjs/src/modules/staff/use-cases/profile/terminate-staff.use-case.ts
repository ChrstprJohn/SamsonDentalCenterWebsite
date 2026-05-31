import { StaffProfileCommands } from '../../repositories';

export const terminateStaffUseCase = (
    terminateStaff: (staffId: string) => Promise<{ success: boolean; id: string }>
) => {
    return async (staffId: string) => {
        return await terminateStaff(staffId);
    };
};

// Deprecated class for backwards compatibility
export class TerminateStaffUseCase {
    constructor(private readonly staffCommands: StaffProfileCommands) {}
    async execute(staffId: string) {
        return terminateStaffUseCase((id) => this.staffCommands.terminateStaff(id))(staffId);
    }
}

