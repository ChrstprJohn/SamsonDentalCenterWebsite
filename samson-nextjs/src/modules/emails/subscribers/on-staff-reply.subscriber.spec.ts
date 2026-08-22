import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onStaffReplySubscriber } from './on-staff-reply.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onStaffReplySubscriber', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockMaybeSingle = vi.fn();
  const mockEqGuest = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockSelectGuest = vi.fn(() => ({ eq: mockEqGuest }));

  const mockSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'appointments') {
        return { select: mockSelect };
      }
      if (table === 'users') {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { email: 'patient@example.com', first_name: 'John', last_name: 'Doe' } }) })) })) };
      }
      return { select: mockSelectGuest };
    }),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);
  });

  it('sends email to patient when staff replies', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { chat_token: 'chat-tok', patient_id: 'pat-123' },
      error: null,
    });

    await onStaffReplySubscriber.handle({ appointmentId: 'appt-1' });

    expect(createAdminClient).toHaveBeenCalled();
    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      expect.stringContaining('You Have a New Message'),
      'staff_reply',
      expect.objectContaining({
        patientName: 'John Doe',
        chatToken: 'chat-tok',
      }),
      expect.objectContaining({
        threadId: 'appt-1',
      })
    );
  });
});
