import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { resolveDoctorDisplayNameQuery } from './resolve-doctor-display-name.queries';

describe('resolveDoctorDisplayNameQuery', () => {
  let mockSupabase: any;
  const doctorUuid = '22222222-2222-2222-8222-222222222222';

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    };
    mockSupabase.eq.mockReturnValue(mockSupabase);
  });

  it('should resolve doctor display name successfully', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { first_name: 'Jane', last_name: 'Doe' },
      error: null
    });

    const query = resolveDoctorDisplayNameQuery(mockSupabase as unknown as SupabaseClient);
    const displayName = await query(doctorUuid);

    expect(mockSupabase.from).toHaveBeenCalledWith('users');
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', doctorUuid);
    expect(displayName).toBe('Dr. Jane Doe');
  });

  it('should return default fallback Doctor if resolver fails or returns no user', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' }
    });

    const query = resolveDoctorDisplayNameQuery(mockSupabase as unknown as SupabaseClient);
    const displayName = await query(doctorUuid);

    expect(displayName).toBe('Doctor');
  });
});
