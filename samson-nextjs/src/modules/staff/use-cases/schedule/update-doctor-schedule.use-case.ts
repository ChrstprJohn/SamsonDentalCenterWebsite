import { DoctorScheduleDto } from '../../dtos';
import { StaffScheduleCommands } from '../../repositories';

export const updateDoctorScheduleUseCase = (
    upsertSchedule: (data: DoctorScheduleDto) => Promise<any>
) => {
    return async (data: DoctorScheduleDto) => {
        return await upsertSchedule(data);
    };
};

// Deprecated class for backwards compatibility
export class UpdateDoctorScheduleUseCase {
    constructor(private readonly scheduleCommands: StaffScheduleCommands) {}
    async execute(data: DoctorScheduleDto) {
        return updateDoctorScheduleUseCase((d) => this.scheduleCommands.upsertSchedule(d))(data);
    }
}

