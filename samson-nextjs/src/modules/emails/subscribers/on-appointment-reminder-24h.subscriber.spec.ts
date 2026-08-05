import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onAppointmentReminder24hSubscriber } from './on-appointment-reminder-24h.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onAppointmentReminder24hSubscriber', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockUpdate = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));

  const mockSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'appointments') {
        return { select: mockSelect, update: mockUpdate };
      }
      return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: null }) })) })) };
    }),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);
  });

  it('sends 24h reminder with formatted time range and no NaN', async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'appt-24h',
        date: '2026-06-22',
        start_time: '09:00:00',
        confirmation_channel: 'EMAIL',
        service: { name: 'Dental Cleaning', duration_minutes: 45 },
        doctor: { first_name: 'Adrian', last_name: 'Samson' },
        patient: { first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com' },
      },
      error: null,
    });

    await onAppointmentReminder24hSubscriber.handle({ appointmentId: 'appt-24h' });

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'alice@example.com',
      'Reminder: Your Appointment is Tomorrow',
      'appointment_reminder',
      expect.objectContaining({
        patientName: 'Alice Smith',
        dateStr: 'Jun 22, 2026',
        timeRangeStr: '9:00 AM - 9:45 AM',
      })
    );
    expect(JSON.stringify(vi.mocked(ResendService.sendTemplatedEmail).mock.calls)).not.toContain('NaN');
  });
});
