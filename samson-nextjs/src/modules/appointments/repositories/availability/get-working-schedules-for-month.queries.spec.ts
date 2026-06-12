import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { getWorkingSchedulesForMonthQuery } from './get-working-schedules-for-month.queries';

describe('getWorkingSchedulesForMonthQuery', () => {
  let mockSupabase: any;
  const validUuid = '11111111-1111-1111-8111-111111111111';
  const doctorUuid = '22222222-2222-2222-8222-222222222222';

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: [], error: null }))
    };
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.in.mockReturnValue(mockSupabase);
  });

  it('should query monthly schedules and generate calendar dates', async () => {
    const mockData = [{
      id: validUuid,
      doctor_id: doctorUuid,
      day_of_week: 1, // Monday
      start_time: '09:00:00',
      end_time: '17:00:00',
      break_start_time: null,
      break_end_time: null,
    }];
    mockSupabase.then = vi.fn((resolve) => resolve({ data: mockData, error: null }));

    const query = getWorkingSchedulesForMonthQuery(mockSupabase as unknown as SupabaseClient);
    const result = await query('2024-06'); // June 2024 has Mondays on 3, 10, 17, 24

    expect(mockSupabase.from).toHaveBeenCalledWith('doctor_schedules');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].date).toBe('2024-06-03');
    expect(result[0].doctorId).toBe(doctorUuid);
  });

  it('should throw an error on database failure', async () => {
    mockSupabase.then = vi.fn((resolve) => resolve({ data: null, error: { message: 'DB Error' } }));

    const query = getWorkingSchedulesForMonthQuery(mockSupabase as unknown as SupabaseClient);
    await expect(query('2024-06')).rejects.toThrow('Failed to fetch monthly schedules: DB Error');
  });
});
