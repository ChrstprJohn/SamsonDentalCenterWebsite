import { ClinicAppointmentsQueries } from '../../repositories';
import { GetClinicAppointmentsDto, getClinicAppointmentsSchema } from '../../dtos';

export class GetClinicAppointmentsUseCase {
  constructor(
    private readonly clinicAppointmentsQueries: ClinicAppointmentsQueries
  ) {}

  /**
   * Retrieves appointments for clinic dashboard based on filters, ensuring input validation.
   */
  async execute(filters?: GetClinicAppointmentsDto) {
    const validatedFilters = filters ? getClinicAppointmentsSchema.parse(filters) : undefined;
    return this.clinicAppointmentsQueries.getAppointmentsByClinic(validatedFilters);
  }
}
