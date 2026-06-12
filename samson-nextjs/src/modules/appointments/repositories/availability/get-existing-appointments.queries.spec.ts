import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { getExistingAppointmentsQuery } from './get-existing-appointments.queries';

describe('getExistingAppointmentsQuery', () => {
  let mockSupabase: any;
  const apptUuid = '33333333-3333-3333-8333-333333333333';
  const doctorUuid = '22222222-2222-2222-8222-222222222222';

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
  });

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

    const query = getExistingAppointmentsQuery(mockSupabase as unknown as SupabaseClient);
    const result = await query('2024-11-11');

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
    const query = getExistingAppointmentsQuery(mockSupabase as unknown as SupabaseClient);
    await query('2024-11-11', doctorUuid);

    expect(mockSupabase.eq).toHaveBeenCalledWith('doctor_id', doctorUuid);
  });

  it('should throw an error on DB failure', async () => {
    mockSupabase.then = vi.fn((resolve) => resolve({ data: null, error: { message: 'Appt Error' } }));

    const query = getExistingAppointmentsQuery(mockSupabase as unknown as SupabaseClient);
    await expect(query('2024-11-11')).rejects.toThrow('Failed to fetch existing appointments: Appt Error');
  });
});
