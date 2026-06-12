import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { getDoctorSchedulesQuery } from './get-doctor-schedules.queries';

describe('getDoctorSchedulesQuery', () => {
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

  it('should fetch schedules for all doctors on a specific date', async () => {
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

    const query = getDoctorSchedulesQuery(mockSupabase as unknown as SupabaseClient);
    const result = await query('2024-10-10');

    expect(mockSupabase.from).toHaveBeenCalledWith('doctor_schedules');
    expect(mockSupabase.eq).toHaveBeenCalledWith('day_of_week', 4);
    expect(result).toEqual([{
      id: validUuid,
      doctorId: doctorUuid,
      dayOfWeek: 4,
      startTime: '09:00:00',
      endTime: '17:00:00',
      breakStartTime: null,
      breakEndTime: null,
      doctorName: undefined,
    }]);
  });

  it('should query specific doctor schedules if doctorId is provided', async () => {
    const query = getDoctorSchedulesQuery(mockSupabase as unknown as SupabaseClient);
    await query('2024-10-10', doctorUuid);

    expect(mockSupabase.eq).toHaveBeenCalledWith('doctor_id', doctorUuid);
  });

  it('should throw an error on DB failure', async () => {
    mockSupabase.then = vi.fn((resolve) => resolve({ data: null, error: { message: 'DB Error' } }));

    const query = getDoctorSchedulesQuery(mockSupabase as unknown as SupabaseClient);
    await expect(query('2024-10-10')).rejects.toThrow('Failed to fetch doctor schedules: DB Error');
  });
});
