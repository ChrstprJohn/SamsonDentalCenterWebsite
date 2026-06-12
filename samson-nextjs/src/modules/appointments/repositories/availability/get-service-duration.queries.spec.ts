import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { getServiceDurationQuery } from './get-service-duration.queries';

describe('getServiceDurationQuery', () => {
  let mockSupabase: any;
  const serviceUuid = '11111111-1111-1111-8111-111111111111';

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    };
    mockSupabase.eq.mockReturnValue(mockSupabase);
  });

  it('should return service duration minutes successfully', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { duration_minutes: 45 },
      error: null
    });

    const query = getServiceDurationQuery(mockSupabase as unknown as SupabaseClient);
    const duration = await query(serviceUuid);

    expect(mockSupabase.from).toHaveBeenCalledWith('services');
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', serviceUuid);
    expect(duration).toBe(45);
  });

  it('should throw an error if service is not found', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' }
    });

    const query = getServiceDurationQuery(mockSupabase as unknown as SupabaseClient);
    await expect(query(serviceUuid)).rejects.toThrow('Service not found: Not found');
  });
});
