import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { ClinicAppointmentsQueries } from './clinic-appointments.queries';

describe('ClinicAppointmentsQueries', () => {
  let queries: ClinicAppointmentsQueries;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    queries = new ClinicAppointmentsQueries(mockSupabase as unknown as SupabaseClient);
  });

  describe('getAppointmentsByClinic', () => {
    it('should fetch all appointments without filters', async () => {
      const mockData = [{ id: '1' }];
      mockSupabase.order = vi.fn().mockReturnValue(Promise.resolve({ data: mockData, error: null }));

      const result = await queries.getAppointmentsByClinic();

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(result).toEqual(mockData);
    });

    it('should apply filters correctly', async () => {
      const queryMock: any = {
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null }))
      };
      mockSupabase.order = vi.fn().mockReturnValue(queryMock);

      await queries.getAppointmentsByClinic({ date: '2024-01-01', status: 'PENDING', doctorId: 'doc-1' });

      expect(queryMock.eq).toHaveBeenCalledWith('date', '2024-01-01');
      expect(queryMock.eq).toHaveBeenCalledWith('status', 'PENDING');
      expect(queryMock.eq).toHaveBeenCalledWith('doctor_id', 'doc-1');
    });

    it('should throw an error on database failure', async () => {
      const queryMock: any = {
        then: vi.fn((resolve) => resolve({ data: null, error: { message: 'Fetch Error' } }))
      };
      mockSupabase.order = vi.fn().mockReturnValue(queryMock);

      await expect(queries.getAppointmentsByClinic()).rejects.toThrow(
        'Failed to fetch clinic appointments: Fetch Error'
      );
    });
  });
});
