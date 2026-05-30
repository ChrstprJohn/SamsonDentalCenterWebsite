import { PatientProfileQueries } from '../../repositories';

export class GetPatientProfileUseCase {
  constructor(private readonly patientProfileQueries: PatientProfileQueries) {}

  /**
   * Retrieves a patient profile by ID.
   */
  async execute(patientId: string) {
    if (!patientId) {
      throw new Error('Patient ID is required to fetch patient profile.');
    }
    return this.patientProfileQueries.getProfileById(patientId);
  }
}
