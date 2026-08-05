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
  const mockUpdate = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));

  const mockSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'appointments') {
        return { select: mockSelect, update: mockUpdate };
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
      'Your Appointment Has Been Rescheduled',
      'appointment_rescheduled',
      expect.objectContaining({
        patientName: 'John Doe',
        dateStr: 'Jul 20, 2026',
        timeRangeStr: '10:00 AM',
        chatToken: 'chat-tok',
      })
    );
  });

  it('uses the appointment row slot over a stale payload slot', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { chat_token: 'chat-tok', patient_id: 'pat-123', date: '2026-08-10', start_time: '2026-08-10T14:00:00.000Z' },
      error: null,
    });

    await onRescheduleBookingSubscriber.handle({
      appointmentId: 'appt-1',
      patientId: 'pat-123',
      date: '2026-07-20',
      startTime: '2026-07-20T10:00:00.000Z',
    });

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      'appointment_rescheduled',
      expect.objectContaining({
        dateStr: 'Aug 10, 2026',
        timeRangeStr: expect.stringContaining('2:00 PM'),
      })
    );
  });
});
