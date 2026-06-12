import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppointmentAvailabilityQueries } from './appointment-availability.queries';

describe('AppointmentAvailabilityQueries', () => {
  let queries: AppointmentAvailabilityQueries;
  let mockSupabase: any;

  // Compliant UUIDs (satisfying Zod's RFC 4122 v4 UUID format regex constraints)
  const validUuid = '11111111-1111-1111-8111-111111111111';
  const doctorUuid = '22222222-2222-2222-8222-222222222222';
  const apptUuid = '33333333-3333-3333-8333-333333333333';

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: [], error: null }))
    };
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.not.mockReturnValue(mockSupabase);
    queries = new AppointmentAvailabilityQueries(mockSupabase as unknown as SupabaseClient);
  });

  describe('getDoctorSchedules', () => {
    it('should fetch schedules for all doctors on a date', async () => {
      const mockData = [{
        id: validUuid,
        doctor_id: doctorUuid,
        day_of_week: 4, // 2024-10-10 is Thursday
        start_time: '09:00:00',
        end_time: '17:00:00',
        break_start_time: null,
        break_end_time: null,
      }];
      mockSupabase.then = vi.fn((resolve) => resolve({ data: mockData, error: null }));

      const result = await queries.getDoctorSchedules('2024-10-10');
      const dayOfWeek = new Date('2024-10-10').getDay();

      expect(mockSupabase.from).toHaveBeenCalledWith('doctor_schedules');
      expect(mockSupabase.eq).toHaveBeenCalledWith('day_of_week', dayOfWeek);
      expect(result).toEqual([{
        id: validUuid,
        doctorId: doctorUuid,
        dayOfWeek: 4,
        startTime: '09:00:00',
        endTime: '17:00:00',
        breakStartTime: null,
        breakEndTime: null,
      }]);
    });

    it('should fetch schedule for a specific doctor if provided', async () => {
      await queries.getDoctorSchedules('2024-10-10', doctorUuid);
      
      const dayOfWeek = new Date('2024-10-10').getDay();
      expect(mockSupabase.eq).toHaveBeenCalledWith('day_of_week', dayOfWeek);
      expect(mockSupabase.eq).toHaveBeenCalledWith('doctor_id', doctorUuid);
    });

    it('should throw an error on DB failure', async () => {
      mockSupabase.then = vi.fn((resolve) => resolve({ data: null, error: { message: 'Schedule Error' } }));

      await expect(queries.getDoctorSchedules('2024-10-10')).rejects.toThrow(
        'Failed to fetch doctor schedules: Schedule Error'
      );
    });
  });

  describe('getExistingAppointments', () => {
    it('should fetch appointments and exclude cancelled/rejected/displaced', async () => {
      const mockData = [{
        id: apptUuid,
        start_time: '2024-11-11T09:00:00Z',
        end_time: '2024-11-11T09:30:00Z',
        doctor_id: doctorUuid,
        status: 'APPROVED',
        date: '2024-11-11',
      }];
      mockSupabase.then = vi.fn((resolve) => resolve({ data: mockData, error: null }));

      const result = await queries.getExistingAppointments('2024-11-11');

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(mockSupabase.eq).toHaveBeenCalledWith('date', '2024-11-11');
      expect(mockSupabase.not).toHaveBeenCalledWith('status', 'in', '("CANCELLED","REJECTED","DISPLACED")');
      expect(result).toEqual([{
        id: apptUuid,
        startTime: '2024-11-11T09:00:00Z',
        endTime: '2024-11-11T09:30:00Z',
        doctorId: doctorUuid,
        status: 'APPROVED',
        date: '2024-11-11',
      }]);
    });

    it('should filter by doctorId when provided', async () => {
      await queries.getExistingAppointments('2024-11-11', doctorUuid);

      expect(mockSupabase.eq).toHaveBeenCalledWith('doctor_id', doctorUuid);
    });

    it('should throw an error on DB failure', async () => {
      mockSupabase.then = vi.fn((resolve) => resolve({ data: null, error: { message: 'Appt Error' } }));

      await expect(queries.getExistingAppointments('2024-11-11')).rejects.toThrow(
        'Failed to fetch existing appointments: Appt Error'
      );
    });
  });
});
