import { CreateStaffDto, StaffProfileDto } from '../../dtos/exports';


export const createStaffUseCase = (
    createStaff: (userId: string, data: CreateStaffDto) => Promise<StaffProfileDto>
) => {
    return async (userId: string, data: CreateStaffDto) => {
        return await createStaff(userId, data);
    };
};
