import { describe, it, expect, vi } from 'vitest';
import { getOutboxLogsAction } from './get-outbox-logs.action';

vi.mock('@/shared/auth/auth.util', () => ({
  authorizeRole: vi.fn().mockResolvedValue({ id: 'secretary_id' }),
}));

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
  createAdminClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
}));

describe('getOutboxLogsAction', () => {
  it('should successfully execute the action and return log data', async () => {
    const result = await getOutboxLogsAction({});
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
