import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentAvailabilityQueries } from '../../repositories/availability/appointment-availability.queries';
import { GetAvailabilityUseCase } from './get-availability.use-case';

describe('GetAvailabilityUseCase', () => {
  let useCase: GetAvailabilityUseCase;
  let mockAvailabilityQueries: any;

  const serviceId = '1111f111-1111-1111-1111-111111111111';
  const doctorId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    mockAvailabilityQueries = {
      getWorkingSchedulesForMonth: vi.fn(),
      getDoctorSchedules: vi.fn(),
      getExistingAppointments: vi.fn(),
      getServiceDuration: vi.fn(),
      resolveDoctorDisplayName: vi.fn(),
    };

    useCase = new GetAvailabilityUseCase(
      mockAvailabilityQueries as unknown as AppointmentAvailabilityQueries
    );
  });

  describe('getAvailableTimeSlots', () => {
    it('should generate available time slots correctly when doctor has working schedule and no appointments or breaks', async () => {
      mockAvailabilityQueries.getServiceDuration.mockResolvedValueOnce(30);
      mockAvailabilityQueries.getDoctorSchedules.mockResolvedValueOnce([
        {
          staff_id: doctorId,
          start_time: '09:00:00',
          end_time: '11:00:00',
          break_start_time: null,
          break_end_time: null,
        },
      ]);
      mockAvailabilityQueries.getExistingAppointments.mockResolvedValueOnce([]);
      mockAvailabilityQueries.resolveDoctorDisplayName.mockResolvedValueOnce('Dr. John Doe');

      const result = await useCase.getAvailableTimeSlots({
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

    it('should exclude slots that overlap with doctor lunch break', async () => {
      mockAvailabilityQueries.getServiceDuration.mockResolvedValueOnce(30);
      mockAvailabilityQueries.getDoctorSchedules.mockResolvedValueOnce([
        {
          staff_id: doctorId,
          start_time: '09:00:00',
          end_time: '11:00:00',
          break_start_time: '10:00:00',
          break_end_time: '10:30:00',
        },
      ]);
      mockAvailabilityQueries.getExistingAppointments.mockResolvedValueOnce([]);
      mockAvailabilityQueries.resolveDoctorDisplayName.mockResolvedValueOnce('Dr. John Doe');

      const result = await useCase.getAvailableTimeSlots({
        serviceId,
        doctorId,
        date: '2024-12-25',
      });

      expect(result.availableSlots).toHaveLength(3);
      expect(result.availableSlots.map((s) => s.startTime)).not.toContain(
        '2024-12-25T10:00:00.000Z'
      );
    });

    it('should exclude slots that overlap with existing active appointments', async () => {
      mockAvailabilityQueries.getServiceDuration.mockResolvedValueOnce(30);
      mockAvailabilityQueries.getDoctorSchedules.mockResolvedValueOnce([
        {
          staff_id: doctorId,
          start_time: '09:00:00',
          end_time: '11:00:00',
          break_start_time: null,
          break_end_time: null,
        },
      ]);
      mockAvailabilityQueries.getExistingAppointments.mockResolvedValueOnce([
        {
          doctor_id: doctorId,
          start_time: '2024-12-25T09:30:00Z',
          end_time: '2024-12-25T10:00:00Z',
          status: 'APPROVED',
        },
      ]);
      mockAvailabilityQueries.resolveDoctorDisplayName.mockResolvedValueOnce('Dr. John Doe');

      const result = await useCase.getAvailableTimeSlots({
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

  describe('getAvailableDays', () => {
    it('should return available dates for the month', async () => {
      mockAvailabilityQueries.getWorkingSchedulesForMonth.mockResolvedValueOnce([
        { date: '2024-12-01', staff_id: doctorId },
        { date: '2024-12-02', staff_id: doctorId },
      ]);

      mockAvailabilityQueries.getServiceDuration.mockResolvedValue(30);
      mockAvailabilityQueries.resolveDoctorDisplayName.mockResolvedValue('Dr. John Doe');
      mockAvailabilityQueries.getDoctorSchedules
        .mockResolvedValueOnce([
          {
            staff_id: doctorId,
            start_time: '09:00',
            end_time: '10:00',
            doctor_name: 'Dr. John Doe',
          },
        ])
        .mockResolvedValueOnce([
          {
            staff_id: doctorId,
            start_time: '09:00',
            end_time: '10:00',
            doctor_name: 'Dr. John Doe',
          },
        ]);

      mockAvailabilityQueries.getExistingAppointments
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { doctor_id: doctorId, start_time: '2024-12-02T09:00:00Z', end_time: '2024-12-02T09:30:00Z' },
          { doctor_id: doctorId, start_time: '2024-12-02T09:30:00Z', end_time: '2024-12-02T10:00:00Z' },
        ]);

      const result = await useCase.getAvailableDays({
        serviceId,
        doctorId,
        month: '2024-12',
      });

      expect(result.availableDates).toEqual(['2024-12-01']);
    });
  });
});
