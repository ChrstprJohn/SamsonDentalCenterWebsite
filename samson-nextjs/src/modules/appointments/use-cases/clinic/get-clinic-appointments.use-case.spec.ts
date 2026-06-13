import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getClinicAppointmentsUseCase } from './get-clinic-appointments.use-case';
import { ZodError } from 'zod';

describe('GetClinicAppointmentsUseCase', () => {
  let executeFn: ReturnType<typeof getClinicAppointmentsUseCase>;
  let mockGetAppointmentsByClinic: any;

  beforeEach(() => {
    mockGetAppointmentsByClinic = vi.fn();
    executeFn = getClinicAppointmentsUseCase(mockGetAppointmentsByClinic);
  });

  it('should retrieve clinic appointments with no filters', async () => {
    const mockAppointments = [{ id: 'appt-1' }] as any;
    mockGetAppointmentsByClinic.mockResolvedValueOnce(mockAppointments);

    const result = await executeFn();

    expect(result).toEqual(mockAppointments);
    expect(mockGetAppointmentsByClinic).toHaveBeenCalledWith(undefined);
  });

  it('should retrieve clinic appointments with valid filters', async () => {
    const mockAppointments = [{ id: 'appt-2' }] as any;
    const filters = {
      date: '2024-12-25',
      status: 'PENDING' as const,
      doctorId: '22222222-2222-4222-a222-222222222222',
    };
    mockGetAppointmentsByClinic.mockResolvedValueOnce(mockAppointments);

    const result = await executeFn(filters);

    expect(result).toEqual(mockAppointments);
    expect(mockGetAppointmentsByClinic).toHaveBeenCalledWith(filters);
  });

  it('should throw ZodError if filter parameters are invalid', async () => {
    const invalidFilters = {
      date: 'invalid-date-format',
      doctorId: 'invalid-uuid',
    } as any;

    await expect(executeFn(invalidFilters)).rejects.toThrow(ZodError);
    expect(mockGetAppointmentsByClinic).not.toHaveBeenCalled();
  });
});
