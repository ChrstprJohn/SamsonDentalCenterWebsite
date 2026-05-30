import { DependentProfileDto } from '../../dtos';
import { PatientDependentsQueries } from '../../repositories';

export class GetUserDependentsUseCase {
  constructor(private readonly queries: PatientDependentsQueries) {}

  async execute(patientId: string): Promise<DependentProfileDto[]> {
    return this.queries.getDependentsByPatientId(patientId);
  }
}