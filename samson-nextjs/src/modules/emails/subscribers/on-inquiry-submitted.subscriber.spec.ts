import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onInquirySubmittedSubscriber } from './on-inquiry-submitted.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onInquirySubmittedSubscriber', () => {
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect })) } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);
  });

  it('dispatches appointment_request_received email for submitted inquiry', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { name: 'General Consultation' },
    });

    const payload = {
      inquiryId: 'inq-123-456',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '09123456789',
      preferredServiceId: 'service-uuid-1',
      preferredDate: '2026-08-10',
      preferredStartTime: '09:00',
    };

    await onInquirySubmittedSubscriber.handle(payload);

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'john.doe@example.com',
      expect.stringContaining("We've Received Your Booking Request"),
      'appointment_request_received',
      expect.objectContaining({
        accountHolderName: 'John Doe',
        patientName: 'John Doe',
        serviceName: 'General Consultation',
        dateStr: 'Aug 10, 2026',
        timeRangeStr: '9:00 AM',
        appointmentId: 'inq-123-456',
      })
    );
  });
});
