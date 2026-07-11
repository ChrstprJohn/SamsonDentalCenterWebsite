
import { AppointmentDto, GetClinicAppointmentsDto, getClinicAppointmentsSchema } from '../../dtos/exports';

export const getClinicAppointmentsUseCase = (
  getAppointmentsByClinic: (filters?: GetClinicAppointmentsDto) => Promise<AppointmentDto[]>
) => {
  return async (filters?: GetClinicAppointmentsDto): Promise<AppointmentDto[]> => {
    const validatedFilters = filters ? getClinicAppointmentsSchema.parse(filters) : undefined;
    const appointments = await getAppointmentsByClinic(validatedFilters);

    if (validatedFilters?.status === 'PENDING') {
      return [...appointments].sort((a, b) => {
        const aSelf = a.source === 'SELF_BOOKED';
        const bSelf = b.source === 'SELF_BOOKED';
        if (aSelf && !bSelf) return -1;
        if (!aSelf && bSelf) return 1;
        return 0;
      });
    }

    return appointments;
  };
};
