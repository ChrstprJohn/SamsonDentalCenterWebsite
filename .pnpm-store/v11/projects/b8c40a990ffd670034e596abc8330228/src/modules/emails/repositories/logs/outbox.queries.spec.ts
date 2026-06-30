import { describe, it, expect, vi } from 'vitest';
import { getOutboxLogsQuery } from './outbox.queries';
import { SupabaseClient } from '@supabase/supabase-js';

describe('getOutboxLogsQuery', () => {
  it('should query outbox logs correctly', async () => {
    const mockQuery: any = {
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    
    // Make mockQuery thenable so await mockQuery returns the resolved data
    mockQuery.then = (onFulfilled: any) => {
      return Promise.resolve({
        data: [
          {
            id: 'd9b7f54c-1111-4444-9999-555555555555',
            event_type: 'PATIENT_REGISTERED',
            payload: { email: 'jane@example.com' },
            status: 'PROCESSED',
            retry_count: 0,
            created_at: '2026-06-29T08:00:00.000Z',
          },
        ],
        error: null,
      }).then(onFulfilled);
    };

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnValue(mockQuery),
    } as unknown as SupabaseClient;

    const query = getOutboxLogsQuery(mockSupabase);
    const result = await query({ status: 'PROCESSED' });
    expect(result).toHaveLength(1);
    expect(result[0].eventType).toBe('PATIENT_REGISTERED');
  });
});

