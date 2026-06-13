import { RegisterPatientDto, PatientProfileDto } from '../../dtos/exports';

export const registerPatientUseCase = (
    createPatient: (data: RegisterPatientDto) => Promise<PatientProfileDto>
) => {
    return async (data: RegisterPatientDto) => {
        return await createPatient(data);
    };
};
