import { PatientProfileDto } from '../../dtos/exports';

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

