import { RegisterPatientDto } from '../../dtos';
import { PatientProfileCommands } from '../../repositories';

export class RegisterPatientUseCase {
    // Dependency Injection: The class receives its dependencies from the outside
    constructor(private readonly patientCommands: PatientProfileCommands) {}

    async execute(userId: string, data: RegisterPatientDto) {
        // -------------------------------------------------------------
        // Business rules would go here (e.g., checking if the user
        // already has a patient profile by calling a Query repository).
        // -------------------------------------------------------------

        // Delegate the actual database writing to the Command repository
        const newPatient = await this.patientCommands.createPatient(userId, data);

        return newPatient;
    }
}
