import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { markNoShowUseCase } from './mark-no-show.use-case';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

describe('markNoShowUseCase', () => {
  const mockAppointment: any = {
    id: 'appt-id',
    patientId: 'patient-id',
    doctorId: 'doctor-id',
    serviceId: 'service-id',
    status: 'APPROVED',
    date: '2026-06-26',
    startTime: '2026-06-26T12:00:00.000Z',
    endTime: '2026-06-26T13:00:00.000Z',
    rescheduleCount: 0,
    source: 'SELF_BOOKED',
    doctorAssignmentSource: 'SYSTEM',
    createdAt: '2026-06-26T10:00:00.000Z',
    updatedAt: '2026-06-26T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('successfully transitions to NO_SHOW after endTime has passed', async () => {
    // Set system time to 1:05 PM (5 minutes after endTime)
    vi.setSystemTime(new Date('2026-06-26T13:05:00.000Z'));

    const getAppointmentById = vi.fn().mockResolvedValue(mockAppointment);
    const updateAppointmentStatusTransaction = vi.fn().mockResolvedValue({
      ...mockAppointment,
      status: 'NO_SHOW',
    });

    const useCase = markNoShowUseCase({
      getAppointmentById,
      updateAppointmentStatusTransaction,
    });

    const result = await useCase('appt-id', 'actor-id', 'STAFF');

    expect(getAppointmentById).toHaveBeenCalledWith('appt-id');
    expect(updateAppointmentStatusTransaction).toHaveBeenCalledWith(
      'appt-id',
      'actor-id',
      'STAFF',
      'NO_SHOW',
      'No-show marked'
    );
    expect(result.status).toBe('NO_SHOW');
  });

  it('fails if slot end time has not passed yet', async () => {
    // Set system time to 12:30 PM (during appointment slot)
    vi.setSystemTime(new Date('2026-06-26T12:30:00.000Z'));

    const getAppointmentById = vi.fn().mockResolvedValue(mockAppointment);
    const updateAppointmentStatusTransaction = vi.fn();

    const useCase = markNoShowUseCase({
      getAppointmentById,
      updateAppointmentStatusTransaction,
    });

    await expect(useCase('appt-id', 'actor-id', 'STAFF')).rejects.toThrow(
      'Appointment can only be marked as no-show after the scheduled slot time has passed.'
    );
    expect(updateAppointmentStatusTransaction).not.toHaveBeenCalled();
  });

  it('fails if status is not APPROVED', async () => {
    vi.setSystemTime(new Date('2026-06-26T13:05:00.000Z'));

    const getAppointmentById = vi.fn().mockResolvedValue({
      ...mockAppointment,
      status: 'PENDING',
    });
    const updateAppointmentStatusTransaction = vi.fn();

    const useCase = markNoShowUseCase({
      getAppointmentById,
      updateAppointmentStatusTransaction,
    });

    await expect(useCase('appt-id', 'actor-id', 'STAFF')).rejects.toThrow(
      ValidationError
    );
  });
});
