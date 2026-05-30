import { ClinicAppointmentsQueries } from '../../repositories';
import { AppointmentDto, GetClinicAppointmentsDto, getClinicAppointmentsSchema } from '../../dtos';

export class GetClinicAppointmentsUseCase {
  constructor(
    private readonly clinicAppointmentsQueries: ClinicAppointmentsQueries
  ) {}

  /**
   * Retrieves appointments for clinic dashboard based on filters, ensuring input validation.
   */
  async execute(filters?: GetClinicAppointmentsDto): Promise<AppointmentDto[]> {
    const validatedFilters = filters ? getClinicAppointmentsSchema.parse(filters) : undefined;
    return this.clinicAppointmentsQueries.getAppointmentsByClinic(validatedFilters);
  }
}
