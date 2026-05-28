import { DoctorScheduleDto } from '../dtos/doctor-schedule.dto';
import { StaffScheduleCommands } from '../repositories/staff-schedule.commands';

export class UpdateDoctorScheduleUseCase {
    constructor(private readonly scheduleCommands: StaffScheduleCommands) {}

    async execute(data: DoctorScheduleDto) {
        // In the future, you could add business rules here
        // e.g., "Cannot change schedule if appointments are booked"
        return await this.scheduleCommands.upsertSchedule(data);
    }
}
