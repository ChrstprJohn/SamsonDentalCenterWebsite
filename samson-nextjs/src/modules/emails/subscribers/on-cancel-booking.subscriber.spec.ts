import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onCancelBookingSubscriber } from './on-cancel-booking.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onCancelBookingSubscriber', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));

  const mockSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'appointments') {
        return { select: mockSelect };
      }
      if (table === 'users') {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { email: 'patient@example.com' } }) })) })) };
      }
      return { select: vi.fn() };
    }),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);
  });

  it('sends silent cancellation email', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { patient_id: 'pat-123' },
      error: null,
    });

    await onCancelBookingSubscriber.handle({
      appointmentId: 'appt-1',
      patientName: 'John Doe',
      date: '2026-07-20',
    });

    expect(createAdminClient).toHaveBeenCalled();
    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      'Appointment Cancelled – Samson Dental Center',
      'appointment_cancelled',
      expect.objectContaining({
        patientName: 'John Doe',
        dateStr: 'Jul 20, 2026',
      })
    );
  });
});
