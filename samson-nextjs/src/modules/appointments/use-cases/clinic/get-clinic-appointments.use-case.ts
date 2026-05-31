import { ClinicAppointmentsQueries } from '../../repositories';
import { AppointmentDto, GetClinicAppointmentsDto, getClinicAppointmentsSchema } from '../../dtos';

export const getClinicAppointmentsUseCase = (
  getAppointmentsByClinic: (filters?: GetClinicAppointmentsDto) => Promise<AppointmentDto[]>
) => {
  return async (filters?: GetClinicAppointmentsDto): Promise<AppointmentDto[]> => {
    const validatedFilters = filters ? getClinicAppointmentsSchema.parse(filters) : undefined;
    return getAppointmentsByClinic(validatedFilters);
  };
};

/** @deprecated Use getClinicAppointmentsUseCase directly instead */
export class GetClinicAppointmentsUseCase {
  constructor(
    private readonly clinicAppointmentsQueries: ClinicAppointmentsQueries
  ) {}

  /**
   * Retrieves appointments for clinic dashboard based on filters, ensuring input validation.
   */
  async execute(filters?: GetClinicAppointmentsDto): Promise<AppointmentDto[]> {
    return getClinicAppointmentsUseCase((f) =>
      this.clinicAppointmentsQueries.getAppointmentsByClinic(f)
    )(filters);
  }
}
