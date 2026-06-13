import { DoctorScheduleDto } from '../../dtos/exports';


export const updateDoctorScheduleUseCase = (
    upsertSchedule: (data: DoctorScheduleDto) => Promise<any>
) => {
    return async (data: DoctorScheduleDto) => {
        return await upsertSchedule(data);
    };
};
