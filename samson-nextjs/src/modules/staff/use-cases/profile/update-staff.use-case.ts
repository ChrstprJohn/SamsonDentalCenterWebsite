import { UpdateStaffDto, StaffProfileDto } from '../../dtos/exports';


export const updateStaffUseCase = (
    updateStaff: (id: string, data: Partial<UpdateStaffDto>) => Promise<StaffProfileDto>
) => {
    return async (id: string, data: Partial<UpdateStaffDto>) => {
        return await updateStaff(id, data);
    };
};
