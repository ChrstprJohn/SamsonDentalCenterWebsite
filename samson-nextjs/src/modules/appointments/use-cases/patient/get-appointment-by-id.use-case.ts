import { AppointmentDto } from '../../dtos';

export const getAppointmentByIdUseCase = (
  getAppointmentById: (appointmentId: string) => Promise<AppointmentDto>
) => {
  return async (appointmentId: string): Promise<AppointmentDto> => {
    return await getAppointmentById(appointmentId);
  };
};
