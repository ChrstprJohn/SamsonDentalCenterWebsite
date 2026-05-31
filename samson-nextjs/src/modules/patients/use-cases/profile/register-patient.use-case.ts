import { RegisterPatientDto, PatientProfileDto } from '../../dtos';
import { PatientProfileCommands } from '../../repositories';

export const registerPatientUseCase = (
    createPatient: (data: RegisterPatientDto) => Promise<PatientProfileDto>
) => {
    return async (data: RegisterPatientDto) => {
        return await createPatient(data);
    };
};

// Deprecated class for backwards compatibility
export class RegisterPatientUseCase {
    constructor(private readonly patientCommands: PatientProfileCommands) {}
    async execute(data: RegisterPatientDto) {
        return registerPatientUseCase((d) => this.patientCommands.createPatient(d))(data);
    }
}
