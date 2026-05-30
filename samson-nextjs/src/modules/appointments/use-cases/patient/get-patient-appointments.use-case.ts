import { PatientAppointmentsQueries } from '../../repositories';
import { AppointmentDto } from '../../dtos';

export class GetPatientAppointmentsUseCase {
  constructor(
    private readonly patientAppointmentsQueries: PatientAppointmentsQueries
  ) {}

  /**
   * Retrieves all appointments for a patient.
   */
  async execute(userId: string): Promise<AppointmentDto[]> {
    if (!userId) {
      throw new Error('User ID is required to fetch patient appointments.');
    }
    return this.patientAppointmentsQueries.getAppointmentsByUser(userId);
  }
}
