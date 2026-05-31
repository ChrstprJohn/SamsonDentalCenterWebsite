import { DependentProfileDto } from '../../dtos';
import { PatientDependentsQueries } from '../../repositories';

export const getUserDependentsUseCase = (
  getDependentsByPatientId: (patientId: string) => Promise<DependentProfileDto[]>
) => {
  return async (patientId: string): Promise<DependentProfileDto[]> => {
    return getDependentsByPatientId(patientId);
  };
};

// Deprecated class for backwards compatibility
export class GetUserDependentsUseCase {
  constructor(private readonly queries: PatientDependentsQueries) {}
  async execute(patientId: string): Promise<DependentProfileDto[]> {
    return getUserDependentsUseCase((pid) => this.queries.getDependentsByPatientId(pid))(patientId);
  }
}