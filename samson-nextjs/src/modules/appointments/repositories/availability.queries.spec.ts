import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { AvailabilityQueries } from './availability.queries';

describe('AvailabilityQueries', () => {
  let queries: AvailabilityQueries;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: [], error: null }))
    };
    // Mock the chaining structure correctly for Promises
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.not.mockReturnValue(mockSupabase);
    queries = new AvailabilityQueries(mockSupabase as unknown as SupabaseClient);
  });

  describe('getDoctorSchedules', () => {
    it('should fetch schedules for all doctors on a date', async () => {
      const mockData = [{ id: '1', staff_id: 'doc-1' }];
      mockSupabase.then = vi.fn((resolve) => resolve({ data: mockData, error: null }));

      const result = await queries.getDoctorSchedules('2024-10-10');

      expect(mockSupabase.from).toHaveBeenCalledWith('staff_schedules');
      expect(mockSupabase.eq).toHaveBeenCalledWith('date', '2024-10-10');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_working', true);
      expect(result).toEqual(mockData);
    });

    it('should fetch schedule for a specific doctor if provided', async () => {
      await queries.getDoctorSchedules('2024-10-10', 'doc-2');

      expect(mockSupabase.eq).toHaveBeenCalledWith('date', '2024-10-10');
      expect(mockSupabase.eq).toHaveBeenCalledWith('staff_id', 'doc-2');
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
      const mockData = [{ id: 'appt-1' }];
      mockSupabase.then = vi.fn((resolve) => resolve({ data: mockData, error: null }));

      const result = await queries.getExistingAppointments('2024-11-11');

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(mockSupabase.eq).toHaveBeenCalledWith('date', '2024-11-11');
      expect(mockSupabase.not).toHaveBeenCalledWith('status', 'in', '("CANCELLED","REJECTED","DISPLACED")');
      expect(result).toEqual(mockData);
    });

    it('should filter by doctorId when provided', async () => {
      await queries.getExistingAppointments('2024-11-11', 'doc-3');

      expect(mockSupabase.eq).toHaveBeenCalledWith('doctor_id', 'doc-3');
    });

    it('should throw an error on DB failure', async () => {
      mockSupabase.then = vi.fn((resolve) => resolve({ data: null, error: { message: 'Appt Error' } }));

      await expect(queries.getExistingAppointments('2024-11-11')).rejects.toThrow(
        'Failed to fetch existing appointments: Appt Error'
      );
    });
  });
});
