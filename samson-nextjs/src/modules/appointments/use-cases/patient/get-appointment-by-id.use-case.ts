import { AppointmentDto } from '../../dtos/exports';

export const getAppointmentByIdUseCase = (
  getAppointmentById: (appointmentId: string) => Promise<AppointmentDto>
) => {
  return async (appointmentId: string): Promise<AppointmentDto> => {
    return await getAppointmentById(appointmentId);
  };
};
