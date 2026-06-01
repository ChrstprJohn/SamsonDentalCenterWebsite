import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestPasswordResetCommand } from './password-recovery.commands';
import { outboxCommands } from '@/shared/outbox/outbox.commands';

// Mock dependencies
vi.mock('@/shared/outbox/outbox.commands', () => ({
  outboxCommands: vi.fn(),
}));

describe('requestPasswordResetCommand', () => {
  let mockSupabaseAdmin: any;
  let mockEmitEvent: any;

  beforeEach(() => {
    mockEmitEvent = vi.fn().mockResolvedValue(undefined);
    (outboxCommands as any).mockReturnValue({ emitEvent: mockEmitEvent });

    mockSupabaseAdmin = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { first_name: 'John' },
              error: null,
            }),
          }),
        }),
      }),
      auth: {
        admin: {
          generateLink: vi.fn().mockResolvedValue({
            data: { properties: { email_otp: '123456' } },
            error: null,
          }),
        },
      },
    };
  });

  it('should generate a recovery link and emit an event when user exists', async () => {
    const command = requestPasswordResetCommand(mockSupabaseAdmin);
    await command('test@example.com');

    // Verify user fetch
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('users');

    // Verify generateLink
    expect(mockSupabaseAdmin.auth.admin.generateLink).toHaveBeenCalledWith({
      type: 'recovery',
      email: 'test@example.com',
    });

    // Verify outbox emission
    expect(mockEmitEvent).toHaveBeenCalledWith('PASSWORD_RESET_REQUESTED', {
      email: 'test@example.com',
      firstName: 'John',
      otpCode: '123456',
    });
  });

  it('should silently return if user does not exist (prevents enumeration)', async () => {
    mockSupabaseAdmin.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: new Error('User not found'),
    });

    const command = requestPasswordResetCommand(mockSupabaseAdmin);
    await command('notfound@example.com');

    // Should NOT call generateLink
    expect(mockSupabaseAdmin.auth.admin.generateLink).not.toHaveBeenCalled();
    // Should NOT emit event
    expect(mockEmitEvent).not.toHaveBeenCalled();
  });

  it('should return if generateLink fails', async () => {
    mockSupabaseAdmin.auth.admin.generateLink.mockResolvedValueOnce({
      data: null,
      error: new Error('Auth error'),
    });

    const command = requestPasswordResetCommand(mockSupabaseAdmin);
    await command('test@example.com');

    // Should NOT emit event
    expect(mockEmitEvent).not.toHaveBeenCalled();
  });
});
