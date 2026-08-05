import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onAppointmentConvertedSubscriber } from './on-appointment-converted.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';
import { formatClinicTime, calculateEndTime } from '@/shared/utils/date.util';
import { z } from 'zod';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onAppointmentConvertedSubscriber', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect, update: mockUpdate })) } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);
  });

  it('queries database and dispatches email for a converted appointment', async () => {
    const validPayload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
      doctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
      date: '2026-06-25',
      startTime: '09:00',
      durationMinutes: 30,
      inquiryId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
      guestName: 'Jane Doe',
      guestEmail: 'jane.doe@example.com',
      guestPhone: '09123456789',
    };

    mockSingle
      .mockResolvedValueOnce({
        data: { name: 'Teeth Cleaning' },
        error: null,
      }) // service
      .mockResolvedValueOnce({
        data: { first_name: 'Jane', last_name: 'Smith' },
        error: null,
      }) // doctor
      .mockResolvedValueOnce({
        data: { chat_token: 'chat-tok' },
        error: null,
      }); // appointment chat_token

    const start = validPayload.startTime;
    const end = calculateEndTime(start, validPayload.durationMinutes);
    const expectedTimeRange = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    await onAppointmentConvertedSubscriber.handle(validPayload);

    expect(createAdminClient).toHaveBeenCalled();
    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'jane.doe@example.com',
      expect.stringContaining('Your Appointment is Confirmed'),
      'appointment_confirmed',
      expect.objectContaining({
        patientName: 'Jane Doe',
        serviceName: 'Teeth Cleaning',
        doctorName: 'Dr. Jane Smith',
        dateStr: 'Jun 25, 2026',
        timeRangeStr: expectedTimeRange,
        appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      })
    );
  });

  it('throws ZodError on invalid payload', async () => {
    const invalidPayload = {
      appointmentId: 'not-a-uuid',
    };

    await expect(onAppointmentConvertedSubscriber.handle(invalidPayload)).rejects.toThrow(z.ZodError);
    expect(ResendService.sendTemplatedEmail).not.toHaveBeenCalled();
  });
});
