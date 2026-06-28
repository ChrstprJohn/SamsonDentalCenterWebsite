
import { AppointmentDto } from '../../dtos/exports';

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
