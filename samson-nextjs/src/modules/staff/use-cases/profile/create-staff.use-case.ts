import { CreateStaffDto } from '../../dtos';
import { StaffProfileCommands } from '../../repositories';

export class CreateStaffUseCase {
    // Dependency Injection: The class receives its dependencies from the outside
    constructor(private readonly staffCommands: StaffProfileCommands) {}

    async execute(userId: string, data: CreateStaffDto) {
        // -------------------------------------------------------------
        // Business rules would go here (e.g., checking if the user
        // already has a patient profile by calling a Query repository).
        // -------------------------------------------------------------

        // Delegate the actual database writing to the Command repository
        const newStaff = await this.staffCommands.createStaff(userId, data);

        return newStaff;
    }
}
