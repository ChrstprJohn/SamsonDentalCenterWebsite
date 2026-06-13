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
      const mockData = [{
        id: '1a95a63c-333e-4b68-98e3-82bdf1a07bd2',
        service_id: '2a95a63c-333e-4b68-98e3-82bdf1a07bd2',
        doctor_id: '3a95a63c-333e-4b68-98e3-82bdf1a07bd2',
        status: 'PENDING',
        date: '2023-10-10',
        start_time: '2023-10-10T10:00:00Z',
        end_time: '2023-10-10T10:30:00Z'
      }];
      mockSupabase.order.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await queries.getAppointmentsByUser('user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(mockSupabase.eq).toHaveBeenCalledWith('patient_id', 'user-123');
      expect(mockSupabase.order).toHaveBeenCalledWith('start_time', { ascending: false });
      expect(result).toEqual([
        expect.objectContaining({
          id: '1a95a63c-333e-4b68-98e3-82bdf1a07bd2',
          startTime: '2023-10-10T10:00:00Z',
        }),
      ]);
    });

    it('should throw an error on database failure', async () => {
      mockSupabase.order.mockResolvedValueOnce({ data: null, error: { message: 'DB Error' } });

      await expect(queries.getAppointmentsByUser('user-123')).rejects.toThrow(
        'Failed to fetch user appointments: DB Error'
      );
    });
  });
});
