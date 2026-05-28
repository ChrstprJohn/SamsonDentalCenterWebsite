import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppointmentAvailabilityQueries } from '../repositories/appointment-availability.queries';
import { GetAvailabilityUseCase } from './get-availability.use-case';

describe('GetAvailabilityUseCase', () => {
  let useCase: GetAvailabilityUseCase;
  let mockSupabase: any;
  let mockAvailabilityQueries: any;

  const serviceId = '1111f111-1111-1111-1111-111111111111';
  const doctorId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      single: vi.fn(),
      then: vi.fn((resolve) => resolve({ data: [], error: null })),
    };
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.like.mockReturnValue(mockSupabase);

    mockAvailabilityQueries = {
      getDoctorSchedules: vi.fn(),
      getExistingAppointments: vi.fn(),
    };

    useCase = new GetAvailabilityUseCase(
      mockSupabase as unknown as SupabaseClient,
      mockAvailabilityQueries as unknown as AppointmentAvailabilityQueries
    );
  });

  describe('getAvailableTimeSlots', () => {
    it('should generate available time slots correctly when doctor has working schedule and no appointments or breaks', async () => {
      // Mock service duration
      mockSupabase.single.mockResolvedValueOnce({
        data: { duration_minutes: 30 },
        error: null,
      });

      // Mock doctor schedule
      mockAvailabilityQueries.getDoctorSchedules.mockResolvedValueOnce([
        {
          staff_id: doctorId,
          start_time: '09:00:00',
          end_time: '11:00:00',
          break_start_time: null,
          break_end_time: null,
          doctor_name: 'Dr. John Doe',
        },
      ]);

      // Mock no existing appointments
      mockAvailabilityQueries.getExistingAppointments.mockResolvedValueOnce([]);

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
      mockSupabase.single.mockResolvedValueOnce({
        data: { duration_minutes: 30 },
        error: null,
      });

      mockAvailabilityQueries.getDoctorSchedules.mockResolvedValueOnce([
        {
          staff_id: doctorId,
          start_time: '09:00:00',
          end_time: '11:00:00',
          break_start_time: '10:00:00',
          break_end_time: '10:30:00',
          doctor_name: 'Dr. John Doe',
        },
      ]);

      mockAvailabilityQueries.getExistingAppointments.mockResolvedValueOnce([]);

      const result = await useCase.getAvailableTimeSlots({
        serviceId,
        doctorId,
        date: '2024-12-25',
      });

      // 09:00 - 09:30 (ok), 09:30 - 10:00 (ok), 10:00 - 10:30 (break - skip), 10:30 - 11:00 (ok)
      expect(result.availableSlots).toHaveLength(3);
      expect(result.availableSlots.map(s => s.startTime)).not.toContain('2024-12-25T10:00:00.000Z');
    });

    it('should exclude slots that overlap with existing active appointments', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { duration_minutes: 30 },
        error: null,
      });

      mockAvailabilityQueries.getDoctorSchedules.mockResolvedValueOnce([
        {
          staff_id: doctorId,
          start_time: '09:00:00',
          end_time: '11:00:00',
          break_start_time: null,
          break_end_time: null,
          doctor_name: 'Dr. John Doe',
        },
      ]);

      // Mock an existing appointment at 09:30 - 10:00
      mockAvailabilityQueries.getExistingAppointments.mockResolvedValueOnce([
        {
          doctor_id: doctorId,
          start_time: '2024-12-25T09:30:00Z',
          end_time: '2024-12-25T10:00:00Z',
          status: 'APPROVED',
        },
      ]);

      const result = await useCase.getAvailableTimeSlots({
        serviceId,
        doctorId,
        date: '2024-12-25',
      });

      // 09:00 (ok), 09:30 (taken), 10:00 (ok), 10:30 (ok)
      expect(result.availableSlots).toHaveLength(3);
      expect(result.availableSlots.map(s => s.startTime)).not.toContain('2024-12-25T09:30:00.000Z');
    });
  });

  describe('getAvailableDays', () => {
    it('should return available dates for the month', async () => {
      // Mock month schedules call in supabase
      mockSupabase.then = vi.fn((resolve) =>
        resolve({
          data: [
            { date: '2024-12-01', staff_id: doctorId },
            { date: '2024-12-02', staff_id: doctorId },
          ],
          error: null,
        })
      );

      // Mock time slot responses for 12-01 (available) and 12-02 (no slots)
      mockSupabase.single.mockResolvedValue({
        data: { duration_minutes: 30 },
        error: null,
      });

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
        .mockResolvedValueOnce([]) // 12-01 free
        .mockResolvedValueOnce([  // 12-02 fully booked
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
