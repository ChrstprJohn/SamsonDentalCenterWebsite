import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resendReminderAction } from './resend-reminder.action';

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      }),
    },
  }),
  createAdminClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockImplementation(() => {
            return Promise.resolve({
              data: {
                role: 'SECRETARY',
                email: 'patient@example.com',
                patient: { email: 'patient@example.com' },
              },
              error: null,
            });
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
}));

vi.mock('@/orchestrators/event-subscribers', () => ({
  bootstrapEventSubscribers: vi.fn(),
}));

describe('resendReminderAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully resends a 24H reminder', async () => {
    const res = await resendReminderAction({
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      reminderType: '24H',
    });

    expect(res.success).toBe(true);
    expect(res.message).toContain('24H reminder dispatched successfully');
  });
});
