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
      if (table === 'outbox') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              contains: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn().mockResolvedValue({ data: [] }),
                })),
              })),
            })),
          })),
        };
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
      expect.stringContaining('Your Appointment Has Been Rescheduled'),
      'appointment_rescheduled',
      expect.objectContaining({
        patientName: 'John Doe',
        dateStr: 'Jul 20, 2026',
        timeRangeStr: '10:00 AM - 10:30 AM',
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

  it('passes previous doctor, service, date, and time to email template when provided in payload', async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        chat_token: 'chat-tok',
        patient_id: 'pat-123',
        date: '2026-08-15',
        start_time: '2026-08-15T14:00:00.000Z',
        end_time: '2026-08-15T15:00:00.000Z',
        service: { name: 'Root Canal Therapy', duration_minutes: 60 },
        doctor: { first_name: 'Gabriella', last_name: 'Samson' },
      },
      error: null,
    });

    await onRescheduleBookingSubscriber.handle({
      appointmentId: 'appt-1',
      patientId: 'pat-123',
      date: '2026-08-15',
      startTime: '2026-08-15T14:00:00.000Z',
      endTime: '2026-08-15T15:00:00.000Z',
      oldDate: '2026-08-10',
      oldStartTime: '2026-08-10T09:00:00.000Z',
      oldEndTime: '2026-08-10T09:30:00.000Z',
      oldDoctorName: 'Dr. Adrian Samson',
      oldServiceName: 'General Consultation',
      rescheduleReason: 'Doctor requested schedule adjustment',
    });

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      expect.stringContaining('Your Appointment Has Been Rescheduled'),
      'appointment_rescheduled',
      expect.objectContaining({
        doctorName: 'Dr. Gabriella Samson',
        serviceName: 'Root Canal Therapy',
        oldDoctorName: 'Dr. Adrian Samson',
        oldServiceName: 'General Consultation',
        oldDateStr: 'Aug 10, 2026',
        oldTimeRangeStr: '9:00 AM – 9:30 AM',
        rescheduleReason: 'Doctor requested schedule adjustment',
      })
    );
  });

  it('looks up previous reschedule details from outbox history on manual resend without direct payload old fields', async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        chat_token: 'chat-tok',
        patient_id: 'pat-123',
        date: '2026-08-15',
        start_time: '2026-08-15T14:00:00.000Z',
        end_time: '2026-08-15T15:00:00.000Z',
        service: { name: 'Root Canal Therapy', duration_minutes: 60 },
        doctor: { first_name: 'Gabriella', last_name: 'Samson' },
      },
      error: null,
    });

    const mockLimit = vi.fn().mockResolvedValue({
      data: [
        {
          payload: {
            oldDate: '2026-08-10',
            oldStartTime: '2026-08-10T09:00:00.000Z',
            oldEndTime: '2026-08-10T09:30:00.000Z',
            oldDoctorName: 'Dr. Adrian Samson',
            oldServiceName: 'General Consultation',
            rescheduleReason: 'Original reason from first reschedule',
          },
        },
      ],
    });
    const mockOrder = vi.fn(() => ({ limit: mockLimit }));
    const mockContains = vi.fn(() => ({ order: mockOrder }));
    const mockEqOutbox = vi.fn(() => ({ contains: mockContains }));

    // Mock from('outbox')
    const originalFrom = mockSupabase.from;
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'outbox') {
        return { select: vi.fn(() => ({ eq: mockEqOutbox })) };
      }
      return originalFrom(table);
    });

    await onRescheduleBookingSubscriber.handle({
      appointmentId: 'appt-1',
      email: 'patient@example.com',
    });

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      expect.stringContaining('Your Appointment Has Been Rescheduled'),
      'appointment_rescheduled',
      expect.objectContaining({
        doctorName: 'Dr. Gabriella Samson',
        serviceName: 'Root Canal Therapy',
        oldDoctorName: 'Dr. Adrian Samson',
        oldServiceName: 'General Consultation',
        oldDateStr: 'Aug 10, 2026',
        oldTimeRangeStr: '9:00 AM – 9:30 AM',
        rescheduleReason: 'Original reason from first reschedule',
      })
    );
  });
});
