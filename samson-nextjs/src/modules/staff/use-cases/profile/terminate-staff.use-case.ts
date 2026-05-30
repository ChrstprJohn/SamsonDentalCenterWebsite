import { StaffProfileCommands } from '../../repositories';

export class TerminateStaffUseCase {
    constructor(private readonly staffCommands: StaffProfileCommands) {}

    async execute(staffId: string) {
        return await this.staffCommands.terminateStaff(staffId);
    }
}
