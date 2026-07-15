import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRescheduleBookingSubscriber } from './on-reschedule-booking.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onRescheduleBookingSubscriber', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));

  const mockSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'appointments') {
        return { select: mockSelect };
      }
      if (table === 'users') {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { email: 'patient@example.com', first_name: 'John', last_name: 'Doe' } }) })) })) };
      }
      return { select: vi.fn() };
    }),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);
  });

  it('sends silent reschedule email', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { chat_token: 'chat-tok', patient_id: 'pat-123' },
      error: null,
    });

    await onRescheduleBookingSubscriber.handle({
      appointmentId: 'appt-1',
      patientId: 'pat-123',
      date: '2026-07-20',
      startTime: '2026-07-20T10:00:00.000Z',
    });

    expect(createAdminClient).toHaveBeenCalled();
    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      'Appointment Rescheduled – Samson Dental Center',
      'appointment_rescheduled',
      expect.objectContaining({
        patientName: 'John Doe',
        dateStr: 'Jul 20, 2026',
        timeRangeStr: '10:00 AM',
        chatToken: 'chat-tok',
      })
    );
  });
});
