import { RegisterPatientDto, PatientProfileDto } from '../../dtos';
import { PatientProfileCommands } from '../../repositories';

export const registerPatientUseCase = (
    createPatient: (userId: string, data: RegisterPatientDto) => Promise<PatientProfileDto>
) => {
    return async (userId: string, data: RegisterPatientDto) => {
        return await createPatient(userId, data);
    };
};

// Deprecated class for backwards compatibility
export class RegisterPatientUseCase {
    constructor(private readonly patientCommands: PatientProfileCommands) {}
    async execute(userId: string, data: RegisterPatientDto) {
        return registerPatientUseCase((uid, d) => this.patientCommands.createPatient(uid, d))(userId, data);
    }
}

