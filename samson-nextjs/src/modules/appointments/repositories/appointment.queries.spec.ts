import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppointmentQueries } from './appointment.queries';

describe('AppointmentQueries', () => {
  let queries: AppointmentQueries;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    queries = new AppointmentQueries(mockSupabase as unknown as SupabaseClient);
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

  describe('getAppointmentsByClinic', () => {
    it('should fetch all appointments without filters', async () => {
      const mockData = [{ id: '1' }];
      // When no filters, order resolves directly. Since query is a chain, mock is resolved at order or await query
      // For mocking, we simulate query returning data directly.
      mockSupabase.order = vi.fn().mockReturnValue(Promise.resolve({ data: mockData, error: null }));

      const result = await queries.getAppointmentsByClinic();

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(result).toEqual(mockData);
    });

    it('should apply filters correctly', async () => {
      // Re-setup mock for dynamic chaining
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
