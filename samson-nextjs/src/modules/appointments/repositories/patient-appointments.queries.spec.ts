import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { PatientAppointmentsQueries } from './patient-appointments.queries';

describe('PatientAppointmentsQueries', () => {
  let queries: PatientAppointmentsQueries;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    queries = new PatientAppointmentsQueries(mockSupabase as unknown as SupabaseClient);
  });

  describe('getAppointmentsByUser', () => {
    it('should fetch appointments for a specific user', async () => {
      const mockData = [{ id: '1', start_time: '2023-10-10' }];
      mockSupabase.order.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await queries.getAppointmentsByUser('user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockSupabase.order).toHaveBeenCalledWith('start_time', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('should throw an error on database failure', async () => {
      mockSupabase.order.mockResolvedValueOnce({ data: null, error: { message: 'DB Error' } });

      await expect(queries.getAppointmentsByUser('user-123')).rejects.toThrow(
        'Failed to fetch user appointments: DB Error'
      );
    });
  });
});
