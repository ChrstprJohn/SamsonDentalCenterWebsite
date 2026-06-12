import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { getExistingAppointmentsForMonthQuery } from './get-existing-appointments-for-month.queries';

describe('getExistingAppointmentsForMonthQuery', () => {
  let mockSupabase: any;
  const apptUuid = '33333333-3333-3333-8333-333333333333';
  const doctorUuid = '22222222-2222-2222-8222-222222222222';

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: [], error: null }))
    };
    mockSupabase.gte.mockReturnValue(mockSupabase);
    mockSupabase.lte.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.not.mockReturnValue(mockSupabase);
  });

  it('should fetch appointments for the whole month and exclude cancelled/rejected/displaced', async () => {
    const mockData = [{
      id: apptUuid,
      start_time: '2024-11-11T09:00:00Z',
      end_time: '2024-11-11T09:30:00Z',
      doctor_id: doctorUuid,
      status: 'APPROVED',
      date: '2024-11-11',
    }];
    mockSupabase.then = vi.fn((resolve) => resolve({ data: mockData, error: null }));

    const query = getExistingAppointmentsForMonthQuery(mockSupabase as unknown as SupabaseClient);
    const result = await query('2024-11');

    expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
    expect(mockSupabase.gte).toHaveBeenCalledWith('date', '2024-11-01');
    expect(mockSupabase.lte).toHaveBeenCalledWith('date', '2024-11-30'); // Nov has 30 days
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

  it('should throw an error on invalid month format', async () => {
    const query = getExistingAppointmentsForMonthQuery(mockSupabase as unknown as SupabaseClient);
    await expect(query('invalid')).rejects.toThrow('Invalid month format: invalid');
  });

  it('should filter by doctorId when provided', async () => {
    const query = getExistingAppointmentsForMonthQuery(mockSupabase as unknown as SupabaseClient);
    await query('2024-11', doctorUuid);

    expect(mockSupabase.eq).toHaveBeenCalledWith('doctor_id', doctorUuid);
  });

  it('should throw an error on DB failure', async () => {
    mockSupabase.then = vi.fn((resolve) => resolve({ data: null, error: { message: 'Appt Month Error' } }));

    const query = getExistingAppointmentsForMonthQuery(mockSupabase as unknown as SupabaseClient);
    await expect(query('2024-11')).rejects.toThrow('Failed to fetch monthly appointments: Appt Month Error');
  });
});
