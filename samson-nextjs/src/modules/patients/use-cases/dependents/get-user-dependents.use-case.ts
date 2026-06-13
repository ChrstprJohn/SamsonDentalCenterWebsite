import { DependentProfileDto } from '../../dtos/exports';

export const getUserDependentsUseCase = (
  getDependentsByPatientId: (patientId: string) => Promise<DependentProfileDto[]>
) => {
  return async (patientId: string): Promise<DependentProfileDto[]> => {
    return getDependentsByPatientId(patientId);
  };
};