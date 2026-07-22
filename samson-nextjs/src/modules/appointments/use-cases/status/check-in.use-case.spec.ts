import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkInUseCase } from './check-in.use-case';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

describe('checkInUseCase', () => {
  const mockAppointment: any = {
    id: 'appt-id',
    patientId: 'patient-id',
    doctorId: 'doctor-id',
    serviceId: 'service-id',
    status: 'APPROVED',
    date: '2026-06-26',
    startTime: '12:00',
    endTime: '13:00',
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

  it('successfully transitions to CHECKED_IN within allowed window', async () => {
    // Set system time to 11:45 +08:00 (15 minutes before startTime 12:00 +08:00)
    vi.setSystemTime(new Date('2026-06-26T03:45:00.000Z'));

    const getAppointmentById = vi.fn().mockResolvedValue(mockAppointment);
    const updateAppointmentStatusTransaction = vi.fn().mockResolvedValue({
      ...mockAppointment,
      status: 'CHECKED_IN',
    });

    const useCase = checkInUseCase({
      getAppointmentById,
      updateAppointmentStatusTransaction,
      getCurrentTime: () => new Date(),
    });

    const result = await useCase('appt-id', 'actor-id', 'STAFF');

    expect(getAppointmentById).toHaveBeenCalledWith('appt-id');
    expect(updateAppointmentStatusTransaction).toHaveBeenCalledWith(
      'appt-id',
      'actor-id',
      'STAFF',
      'CHECKED_IN',
      'Patient checked in',
      'APPROVED'
    );
    expect(result.status).toBe('CHECKED_IN');
  });

  it('fails check-in if appointment is not APPROVED', async () => {
    const getAppointmentById = vi.fn().mockResolvedValue({
      ...mockAppointment,
      status: 'PENDING',
    });
    const updateAppointmentStatusTransaction = vi.fn();

    const useCase = checkInUseCase({
      getAppointmentById,
      updateAppointmentStatusTransaction,
      getCurrentTime: () => new Date(),
    });

    await expect(useCase('appt-id', 'actor-id', 'STAFF')).rejects.toThrow(
      ValidationError
    );
    expect(updateAppointmentStatusTransaction).not.toHaveBeenCalled();
  });

  it('fails check-in if checked in too early (e.g. 45 mins before)', async () => {
    // Set system time to 11:15 +08:00 (45 minutes before startTime 12:00 +08:00)
    vi.setSystemTime(new Date('2026-06-26T03:15:00.000Z'));

    const getAppointmentById = vi.fn().mockResolvedValue(mockAppointment);
    const updateAppointmentStatusTransaction = vi.fn();

    const useCase = checkInUseCase({
      getAppointmentById,
      updateAppointmentStatusTransaction,
      getCurrentTime: () => new Date(),
    });

    await expect(useCase('appt-id', 'actor-id', 'STAFF')).rejects.toThrow(
      'Check-in is only allowed starting 30 minutes before the scheduled time'
    );
    expect(updateAppointmentStatusTransaction).not.toHaveBeenCalled();
  });

  it('fails check-in if checked in too late (e.g. after endTime)', async () => {
    // Set system time to 13:05 +08:00 (5 minutes after endTime 13:00 +08:00)
    vi.setSystemTime(new Date('2026-06-26T05:05:00.000Z'));

    const getAppointmentById = vi.fn().mockResolvedValue(mockAppointment);
    const updateAppointmentStatusTransaction = vi.fn();

    const useCase = checkInUseCase({
      getAppointmentById,
      updateAppointmentStatusTransaction,
      getCurrentTime: () => new Date(),
    });

    await expect(useCase('appt-id', 'actor-id', 'STAFF')).rejects.toThrow(
      'Check-in is only allowed starting 30 minutes before the scheduled time'
    );
    expect(updateAppointmentStatusTransaction).not.toHaveBeenCalled();
  });
});
