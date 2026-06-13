import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { getAppointmentsByClinicQuery } from './clinic-appointments.queries';

describe('ClinicAppointmentsQueries', () => {
  let queryFn: ReturnType<typeof getAppointmentsByClinicQuery>;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    queryFn = getAppointmentsByClinicQuery(mockSupabase as unknown as SupabaseClient);
  });

  describe('getAppointmentsByClinic', () => {
    it('should fetch all appointments without filters', async () => {
      const mockData = [{
        id: '1a95a63c-333e-4b68-98e3-82bdf1a07bd2',
        service_id: '2a95a63c-333e-4b68-98e3-82bdf1a07bd2',
        doctor_id: '3a95a63c-333e-4b68-98e3-82bdf1a07bd2',
        status: 'PENDING',
        date: '2025-01-01',
        start_time: '2025-01-01T10:00:00.000Z',
        end_time: '2025-01-01T10:30:00.000Z',
      }];
      mockSupabase.order = vi.fn().mockReturnValue(Promise.resolve({ data: mockData, error: null }));

      const result = await queryFn();

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(result).toEqual([expect.objectContaining({ id: '1a95a63c-333e-4b68-98e3-82bdf1a07bd2' })]);
    });

    it('should apply filters correctly', async () => {
      const queryMock: any = {
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null }))
      };
      mockSupabase.order = vi.fn().mockReturnValue(queryMock);

      await queryFn({ date: '2024-01-01', status: 'PENDING', doctorId: 'doc-1' });

      expect(queryMock.eq).toHaveBeenCalledWith('date', '2024-01-01');
      expect(queryMock.eq).toHaveBeenCalledWith('status', 'PENDING');
      expect(queryMock.eq).toHaveBeenCalledWith('doctor_id', 'doc-1');
    });

    it('should throw an error on database failure', async () => {
      const queryMock: any = {
        then: vi.fn((resolve) => resolve({ data: null, error: { message: 'Fetch Error' } }))
      };
      mockSupabase.order = vi.fn().mockReturnValue(queryMock);

      await expect(queryFn()).rejects.toThrow(
        'Failed to fetch clinic appointments: Fetch Error'
      );
    });
  });
});
