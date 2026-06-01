import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { processOutboxUseCase } from './process-outbox.use-case';
import { emailOutboxCommands } from '../repositories/email-outbox.commands';

process.env.RESEND_API_KEY = 're_123';
import { ResendService } from '@/shared/services/email/resend.service';
import { SupabaseClient } from '@supabase/supabase-js';

vi.mock('server-only', () => ({}));
vi.mock('../repositories/email-outbox.commands');
vi.mock('@/shared/services/email/resend.service');

describe('processOutboxUseCase', () => {
  let mockSupabase: any;
  let useCase: ReturnType<typeof processOutboxUseCase>;
  let mockOutbox: any;

  beforeEach(() => {
    mockSupabase = {} as SupabaseClient;
    mockOutbox = {
      getPendingEmails: vi.fn(),
      markAsSent: vi.fn(),
      markAsFailed: vi.fn(),
    };
    (emailOutboxCommands as Mock).mockReturnValue(mockOutbox);
    useCase = processOutboxUseCase(mockSupabase);
    vi.clearAllMocks();
  });

  it('should process pending emails and mark them as sent on success', async () => {
    const mockEmail = {
      id: '1',
      recipient: 'test@test.com',
      subject: 'Welcome',
      template_name: 'signup_otp',
      payload: { firstName: 'Test', otpCode: '123' },
    };
    mockOutbox.getPendingEmails.mockResolvedValue([mockEmail]);
    (ResendService.sendTemplatedEmail as Mock).mockResolvedValue(true);

    await useCase();

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'test@test.com', 'Welcome', 'signup_otp', mockEmail.payload
    );
    expect(mockOutbox.markAsSent).toHaveBeenCalledWith('1');
    expect(mockOutbox.markAsFailed).not.toHaveBeenCalled();
  });

  it('should mark email as failed if sending fails', async () => {
    const mockEmail = {
      id: '2',
      recipient: 'fail@test.com',
      subject: 'Welcome',
      template_name: 'signup_otp',
      payload: {},
    };
    mockOutbox.getPendingEmails.mockResolvedValue([mockEmail]);
    (ResendService.sendTemplatedEmail as Mock).mockRejectedValue(new Error('API Error'));

    await useCase();

    expect(mockOutbox.markAsSent).not.toHaveBeenCalled();
    expect(mockOutbox.markAsFailed).toHaveBeenCalledWith('2', 'API Error');
  });
});
