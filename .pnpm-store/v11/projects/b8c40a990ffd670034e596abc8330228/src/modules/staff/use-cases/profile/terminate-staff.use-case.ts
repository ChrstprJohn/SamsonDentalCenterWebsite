

export const terminateStaffUseCase = (
    terminateStaff: (staffId: string) => Promise<{ success: boolean; id: string }>
) => {
    return async (staffId: string) => {
        return await terminateStaff(staffId);
    };
};
