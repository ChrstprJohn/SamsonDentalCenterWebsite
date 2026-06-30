import { describe, it, expect, vi } from 'vitest';
import { resendEmailAction } from './resend-email.action';

vi.mock('@/shared/auth/auth.util', () => ({
  authorizeRole: vi.fn().mockResolvedValue({ id: 'secretary_id' }),
}));

vi.mock('@/orchestrators/event-subscribers', () => ({
  bootstrapEventSubscribers: vi.fn(),
}));

// Mock dependencies
vi.mock('@/shared/database/server', () => {
  const mockDbClient = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        data: {
          id: 'd9b7f54c-1111-4444-9999-555555555555',
          status: 'PROCESSED',
        },
        error: null,
      });
    }),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  };

  return {
    createClient: vi.fn().mockResolvedValue(mockDbClient),
    createAdminClient: vi.fn().mockResolvedValue(mockDbClient),
  };
});

describe('resendEmailAction', () => {
  it('should trigger resend email action successfully', async () => {
    const result = await resendEmailAction({ id: 'd9b7f54c-1111-4444-9999-555555555555' });
    expect(result.data?.success).toBe(true);
  });
});
