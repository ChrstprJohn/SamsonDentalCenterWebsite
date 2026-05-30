import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetClinicAppointmentsUseCase } from './get-clinic-appointments.use-case';
import { ClinicAppointmentsQueries } from '../../repositories/clinic/clinic-appointments.queries';
import { ZodError } from 'zod';

describe('GetClinicAppointmentsUseCase', () => {
  let useCase: GetClinicAppointmentsUseCase;
  let mockQueries: any;

  beforeEach(() => {
    mockQueries = {
      getAppointmentsByClinic: vi.fn(),
    };

    useCase = new GetClinicAppointmentsUseCase(
      mockQueries as unknown as ClinicAppointmentsQueries
    );
  });

  it('should retrieve clinic appointments with no filters', async () => {
    const mockAppointments = [{ id: 'appt-1' }];
    mockQueries.getAppointmentsByClinic.mockResolvedValueOnce(mockAppointments);

    const result = await useCase.execute();

    expect(result).toEqual(mockAppointments);
    expect(mockQueries.getAppointmentsByClinic).toHaveBeenCalledWith(undefined);
  });

  it('should retrieve clinic appointments with valid filters', async () => {
    const mockAppointments = [{ id: 'appt-2' }];
    const filters = {
      date: '2024-12-25',
      status: 'PENDING',
      doctorId: '22222222-2222-4222-a222-222222222222',
    };
    mockQueries.getAppointmentsByClinic.mockResolvedValueOnce(mockAppointments);

    const result = await useCase.execute(filters);

    expect(result).toEqual(mockAppointments);
    expect(mockQueries.getAppointmentsByClinic).toHaveBeenCalledWith(filters);
  });

  it('should throw ZodError if filter parameters are invalid', async () => {
    const invalidFilters = {
      date: 'invalid-date-format',
      doctorId: 'invalid-uuid',
    };

    await expect(useCase.execute(invalidFilters)).rejects.toThrow(ZodError);
    expect(mockQueries.getAppointmentsByClinic).not.toHaveBeenCalled();
  });
});
