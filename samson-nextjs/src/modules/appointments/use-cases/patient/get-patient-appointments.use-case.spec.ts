import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPatientAppointmentsUseCase } from './get-patient-appointments.use-case';
import { PatientAppointmentsQueries } from '../repositories/patient-appointments.queries';

describe('GetPatientAppointmentsUseCase', () => {
  let useCase: GetPatientAppointmentsUseCase;
  let mockQueries: any;

  beforeEach(() => {
    mockQueries = {
      getAppointmentsByUser: vi.fn(),
    };

    useCase = new GetPatientAppointmentsUseCase(
      mockQueries as unknown as PatientAppointmentsQueries
    );
  });

  it('should successfully retrieve patient appointments for a valid user ID', async () => {
    const mockAppointments = [
      { id: 'appt-1', user_id: 'user-123', start_time: '2024-12-25T10:00:00.000Z' },
    ];
    mockQueries.getAppointmentsByUser.mockResolvedValueOnce(mockAppointments);

    const result = await useCase.execute('user-123');

    expect(result).toEqual(mockAppointments);
    expect(mockQueries.getAppointmentsByUser).toHaveBeenCalledWith('user-123');
  });

  it('should throw an error if user ID is empty or missing', async () => {
    await expect(useCase.execute('')).rejects.toThrow(
      'User ID is required to fetch patient appointments.'
    );
    expect(mockQueries.getAppointmentsByUser).not.toHaveBeenCalled();
  });
});
