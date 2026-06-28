
import { AppointmentDto, GetClinicAppointmentsDto, getClinicAppointmentsSchema } from '../../dtos/exports';

export const getClinicAppointmentsUseCase = (
  getAppointmentsByClinic: (filters?: GetClinicAppointmentsDto) => Promise<AppointmentDto[]>
) => {
  return async (filters?: GetClinicAppointmentsDto): Promise<AppointmentDto[]> => {
    const validatedFilters = filters ? getClinicAppointmentsSchema.parse(filters) : undefined;
    return getAppointmentsByClinic(validatedFilters);
  };
};
