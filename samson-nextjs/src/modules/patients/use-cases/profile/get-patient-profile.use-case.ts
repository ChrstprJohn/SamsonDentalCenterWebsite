import { PatientProfileQueries } from '../../repositories';
import { PatientProfileDto } from '../../dtos';

export const getPatientProfileUseCase = (
  getProfileById: (patientId: string) => Promise<PatientProfileDto>
) => {
  return async (patientId: string) => {
    if (!patientId) {
      throw new Error('Patient ID is required to fetch patient profile.');
    }
    return getProfileById(patientId);
  };
};

// Deprecated class for backwards compatibility
export class GetPatientProfileUseCase {
  constructor(private readonly patientProfileQueries: PatientProfileQueries) {}
  async execute(patientId: string) {
    return getPatientProfileUseCase((id) => this.patientProfileQueries.getProfileById(id))(patientId);
  }
}

