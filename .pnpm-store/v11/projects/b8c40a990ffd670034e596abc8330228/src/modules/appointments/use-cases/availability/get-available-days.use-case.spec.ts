import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailableDaysUseCase } from './get-available-days.use-case';

describe('getAvailableDaysUseCase', () => {
  const serviceId = '1111f111-1111-1111-1111-111111111111';
  const doctorId = '22222222-2222-2222-2222-222222222222';

  it('should return available dates for the month using in-memory optimization', async () => {
    const getWorkingSchedulesForMonth = vi.fn().mockResolvedValue([
      {
        date: '2024-12-01',
        doctorId: doctorId,
        startTime: '09:00:00',
        endTime: '10:00:00',
        breakStartTime: null,
        breakEndTime: null,
      },
      {
        date: '2024-12-02',
        doctorId: doctorId,
        startTime: '09:00:00',
        endTime: '10:00:00',
        breakStartTime: null,
        breakEndTime: null,
      },
    ]);

    const getExistingAppointmentsForMonth = vi.fn().mockResolvedValue([
      {
        id: 'appt-1',
        doctorId: doctorId,
        startTime: '2024-12-02T09:00:00Z',
        endTime: '2024-12-02T09:30:00Z',
        status: 'APPROVED',
        date: '2024-12-02',
      },
      {
        id: 'appt-2',
        doctorId: doctorId,
        startTime: '2024-12-02T09:30:00Z',
        endTime: '2024-12-02T10:00:00Z',
        status: 'APPROVED',
        date: '2024-12-02',
      },
    ]);

    const useCase = getAvailableDaysUseCase({
      getWorkingSchedulesForMonth,
      duration: 30,
      getExistingAppointmentsForMonth,
    });

    const result = await useCase({
      serviceId,
      doctorId,
      month: '2024-12',
    });

    expect(result.availableDates).toEqual(['2024-12-01']);
    expect(result.availabilityMap['2024-12-01']).toHaveLength(2);
    expect(getWorkingSchedulesForMonth).toHaveBeenCalledWith('2024-12', doctorId, serviceId);
    expect(getExistingAppointmentsForMonth).toHaveBeenCalledWith('2024-12', doctorId);
  });

  it('should fire schedules and monthly appointments queries before awaiting either result', async () => {
    let resolveSchedules: (value: any[]) => void = () => {};
    let resolveAppointments: (value: any[]) => void = () => {};
    const getWorkingSchedulesForMonth = vi.fn(
      () => new Promise<any[]>((resolve) => {
        resolveSchedules = resolve;
      })
    );
    const getExistingAppointmentsForMonth = vi.fn(
      () => new Promise<any[]>((resolve) => {
        resolveAppointments = resolve;
      })
    );

    const useCase = getAvailableDaysUseCase({
      getWorkingSchedulesForMonth,
      duration: Promise.resolve(30),
      getExistingAppointmentsForMonth,
    });

    const resultPromise = useCase({
      serviceId,
      doctorId,
      month: '2024-12',
    });

    expect(getWorkingSchedulesForMonth).toHaveBeenCalledWith('2024-12', doctorId, serviceId);
    expect(getExistingAppointmentsForMonth).toHaveBeenCalledWith('2024-12', doctorId);

    resolveSchedules([]);
    resolveAppointments([]);
    await expect(resultPromise).resolves.toEqual({
      month: '2024-12',
      serviceId,
      availableDates: [],
      availabilityMap: {},
    });
  });

  it('should return available dates using fallback getAvailableTimeSlots when monthly appointments function is missing', async () => {
    const getWorkingSchedulesForMonth = vi.fn().mockResolvedValue([
      {
        date: '2024-12-01',
        doctorId: doctorId,
        startTime: '09:00:00',
        endTime: '10:00:00',
        breakStartTime: null,
        breakEndTime: null,
      },
    ]);
    const getAvailableTimeSlots = vi.fn().mockResolvedValue({
      availableSlots: [
        {
          startTime: '2024-12-01T09:00:00.000Z',
          endTime: '2024-12-01T09:30:00.000Z',
          doctorId,
          doctorName: 'Dr. Jane Doe',
        },
      ],
    });

    const useCase = getAvailableDaysUseCase({
      getWorkingSchedulesForMonth,
      duration: 30,
      getAvailableTimeSlots,
    });

    const result = await useCase({
      serviceId,
      doctorId,
      month: '2024-12',
    });

    expect(result.availableDates).toEqual(['2024-12-01']);
    expect(result.availabilityMap['2024-12-01']).toHaveLength(1);
    expect(getAvailableTimeSlots).toHaveBeenCalledWith({ serviceId, doctorId, date: '2024-12-01' });
  });
});
