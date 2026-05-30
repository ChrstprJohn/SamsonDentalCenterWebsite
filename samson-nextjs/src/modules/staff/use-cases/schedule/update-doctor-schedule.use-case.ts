import { DoctorScheduleDto } from '../../dtos';
import { StaffScheduleCommands } from '../../repositories';

export class UpdateDoctorScheduleUseCase {
    constructor(private readonly scheduleCommands: StaffScheduleCommands) {}

    async execute(data: DoctorScheduleDto) {
        // In the future, you could add business rules here
        // e.g., "Cannot change schedule if appointments are booked"
        return await this.scheduleCommands.upsertSchedule(data);
    }
}
