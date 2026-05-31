import { PatientAppointmentsQueries } from '../../repositories';
import { AppointmentDto } from '../../dtos';

export const getPatientAppointmentsUseCase = (
  getAppointmentsByUser: (userId: string) => Promise<AppointmentDto[]>
) => {
  return async (userId: string): Promise<AppointmentDto[]> => {
    if (!userId) {
      throw new Error('User ID is required to fetch patient appointments.');
    }
    return getAppointmentsByUser(userId);
  };
};

/** @deprecated Use getPatientAppointmentsUseCase directly instead */
export class GetPatientAppointmentsUseCase {
  constructor(
    private readonly patientAppointmentsQueries: PatientAppointmentsQueries
  ) {}

  /**
   * Retrieves all appointments for a patient.
   */
  async execute(userId: string): Promise<AppointmentDto[]> {
    return getPatientAppointmentsUseCase((uid) =>
      this.patientAppointmentsQueries.getAppointmentsByUser(uid)
    )(userId);
  }
}
