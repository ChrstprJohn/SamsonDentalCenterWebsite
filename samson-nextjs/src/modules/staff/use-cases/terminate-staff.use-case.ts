import { StaffProfileCommands } from '../repositories/staff-profile.commands';

export class TerminateStaffUseCase {
    constructor(private readonly staffCommands: StaffProfileCommands) {}

    async execute(staffId: string) {
        return await this.staffCommands.terminateStaff(staffId);
    }
}
