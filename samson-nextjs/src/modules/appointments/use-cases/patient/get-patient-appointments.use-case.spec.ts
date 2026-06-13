import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientAppointmentsUseCase } from './get-patient-appointments.use-case';

describe('GetPatientAppointmentsUseCase', () => {
  let executeFn: ReturnType<typeof getPatientAppointmentsUseCase>;
  let mockGetAppointmentsByUser: any;

  beforeEach(() => {
    mockGetAppointmentsByUser = vi.fn();
    executeFn = getPatientAppointmentsUseCase(mockGetAppointmentsByUser);
  });

  it('should successfully retrieve patient appointments for a valid user ID', async () => {
    const mockAppointments = [
      { id: 'appt-1', user_id: 'user-123', start_time: '2024-12-25T10:00:00.000Z' },
    ] as any;
    mockGetAppointmentsByUser.mockResolvedValueOnce(mockAppointments);

    const result = await executeFn('user-123');

    expect(result).toEqual(mockAppointments);
    expect(mockGetAppointmentsByUser).toHaveBeenCalledWith('user-123');
  });

  it('should throw an error if user ID is empty or missing', async () => {
    await expect(executeFn('')).rejects.toThrow(
      'User ID is required to fetch patient appointments.'
    );
    expect(mockGetAppointmentsByUser).not.toHaveBeenCalled();
  });
});
