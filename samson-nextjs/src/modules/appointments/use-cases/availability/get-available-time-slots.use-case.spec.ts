import { describe, it, expect, vi } from 'vitest';
import { getAvailableTimeSlotsUseCase } from './get-available-time-slots.use-case';

describe('getAvailableTimeSlotsUseCase', () => {
  const serviceId = '1111f111-1111-1111-1111-111111111111';
  const doctorId = '22222222-2222-2222-2222-222222222222';

  it('should generate available time slots correctly when doctor has working schedule and no appointments or breaks', async () => {
    const getServiceDuration = vi.fn().mockResolvedValue(30);
    const getDoctorSchedules = vi.fn().mockResolvedValue([
      {
        id: 'sched-1',
        doctorId: doctorId,
        dayOfWeek: 3,
        startTime: '09:00:00',
        endTime: '11:00:00',
        breakStartTime: null,
        breakEndTime: null,
      },
    ]);
    const getExistingAppointments = vi.fn().mockResolvedValue([]);
    const resolveDoctorDisplayName = vi.fn().mockResolvedValue('Dr. John Doe');

    const useCase = getAvailableTimeSlotsUseCase({
      getServiceDuration,
      getDoctorSchedules,
      getExistingAppointments,
      resolveDoctorDisplayName,
    });

    const result = await useCase({
      serviceId,
      doctorId,
      date: '2024-12-25',
    });

    expect(result.availableSlots).toHaveLength(4);
    expect(result.availableSlots[0]).toEqual({
      startTime: '2024-12-25T09:00:00.000Z',
      endTime: '2024-12-25T09:30:00.000Z',
      doctorId,
      doctorName: 'Dr. John Doe',
    });
    expect(result.availableSlots[3]).toEqual({
      startTime: '2024-12-25T10:30:00.000Z',
      endTime: '2024-12-25T11:00:00.000Z',
      doctorId,
      doctorName: 'Dr. John Doe',
    });
  });

  it('should exclude slots that overlap with doctor break time', async () => {
    const getServiceDuration = vi.fn().mockResolvedValue(30);
    const getDoctorSchedules = vi.fn().mockResolvedValue([
      {
        id: 'sched-1',
        doctorId: doctorId,
        dayOfWeek: 3,
        startTime: '09:00:00',
        endTime: '11:00:00',
        breakStartTime: '10:00:00',
        breakEndTime: '10:30:00',
      },
    ]);
    const getExistingAppointments = vi.fn().mockResolvedValue([]);
    const resolveDoctorDisplayName = vi.fn().mockResolvedValue('Dr. John Doe');

    const useCase = getAvailableTimeSlotsUseCase({
      getServiceDuration,
      getDoctorSchedules,
      getExistingAppointments,
      resolveDoctorDisplayName,
    });

    const result = await useCase({
      serviceId,
      doctorId,
      date: '2024-12-25',
    });

    expect(result.availableSlots).toHaveLength(3);
    expect(result.availableSlots.map((s) => s.startTime)).not.toContain(
      '2024-12-25T10:00:00.000Z'
    );
  });

  it('should exclude slots that overlap with existing appointments', async () => {
    const getServiceDuration = vi.fn().mockResolvedValue(30);
    const getDoctorSchedules = vi.fn().mockResolvedValue([
      {
        id: 'sched-1',
        doctorId: doctorId,
        dayOfWeek: 3,
        startTime: '09:00:00',
        endTime: '11:00:00',
        breakStartTime: null,
        breakEndTime: null,
      },
    ]);
    const getExistingAppointments = vi.fn().mockResolvedValue([
      {
        id: 'appt-1',
        doctorId: doctorId,
        startTime: '2024-12-25T09:30:00Z',
        endTime: '2024-12-25T10:00:00Z',
        status: 'APPROVED',
        date: '2024-12-25',
      },
    ]);
    const resolveDoctorDisplayName = vi.fn().mockResolvedValue('Dr. John Doe');

    const useCase = getAvailableTimeSlotsUseCase({
      getServiceDuration,
      getDoctorSchedules,
      getExistingAppointments,
      resolveDoctorDisplayName,
    });

    const result = await useCase({
      serviceId,
      doctorId,
      date: '2024-12-25',
    });

    expect(result.availableSlots).toHaveLength(3);
    expect(result.availableSlots.map((s) => s.startTime)).not.toContain(
      '2024-12-25T09:30:00.000Z'
    );
  });
});
