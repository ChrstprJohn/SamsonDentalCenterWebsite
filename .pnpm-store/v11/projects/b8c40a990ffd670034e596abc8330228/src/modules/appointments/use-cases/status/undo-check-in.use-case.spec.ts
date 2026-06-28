import { describe, it, expect, vi } from 'vitest';
import { undoCheckInUseCase } from './undo-check-in.use-case';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

describe('undoCheckInUseCase', () => {
  const mockAppointment: any = {
    id: 'appt-id',
    patientId: 'patient-id',
    doctorId: 'doctor-id',
    serviceId: 'service-id',
    status: 'CHECKED_IN',
    date: '2026-06-26',
    startTime: '2026-06-26T12:00:00.000Z',
    endTime: '2026-06-26T13:00:00.000Z',
    rescheduleCount: 0,
    source: 'SELF_BOOKED',
    doctorAssignmentSource: 'SYSTEM',
    createdAt: '2026-06-26T10:00:00.000Z',
    updatedAt: '2026-06-26T10:00:00.000Z',
  };

  it('successfully transitions from CHECKED_IN to APPROVED', async () => {
    const getAppointmentById = vi.fn().mockResolvedValue(mockAppointment);
    const updateAppointmentStatusTransaction = vi.fn().mockResolvedValue({
      ...mockAppointment,
      status: 'APPROVED',
    });

    const useCase = undoCheckInUseCase({
      getAppointmentById,
      updateAppointmentStatusTransaction,
    });

    const result = await useCase('appt-id', 'actor-id', 'STAFF');

    expect(getAppointmentById).toHaveBeenCalledWith('appt-id');
    expect(updateAppointmentStatusTransaction).toHaveBeenCalledWith(
      'appt-id',
      'actor-id',
      'STAFF',
      'APPROVED',
      'Undo check-in (mistake)',
      'CHECKED_IN'
    );
    expect(result.status).toBe('APPROVED');
  });

  it('fails if appointment is not CHECKED_IN', async () => {
    const getAppointmentById = vi.fn().mockResolvedValue({
      ...mockAppointment,
      status: 'APPROVED',
    });
    const updateAppointmentStatusTransaction = vi.fn();

    const useCase = undoCheckInUseCase({
      getAppointmentById,
      updateAppointmentStatusTransaction,
    });

    await expect(useCase('appt-id', 'actor-id', 'STAFF')).rejects.toThrow(
      ValidationError
    );
    expect(updateAppointmentStatusTransaction).not.toHaveBeenCalled();
  });
});
