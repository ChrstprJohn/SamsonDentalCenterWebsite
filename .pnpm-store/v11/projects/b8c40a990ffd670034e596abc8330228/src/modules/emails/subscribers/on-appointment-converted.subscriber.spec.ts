import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onAppointmentConvertedSubscriber } from './on-appointment-converted.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';
import { formatClinicTime } from '@/shared/utils/date.util';
import { z } from 'zod';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onAppointmentConvertedSubscriber', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect })) } as any;

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
      startTime: '2026-06-25T09:00:00.000Z',
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
      }); // doctor

    const start = new Date(validPayload.startTime);
    const end = new Date(start.getTime() + validPayload.durationMinutes * 60000);
    const expectedTimeRange = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    await onAppointmentConvertedSubscriber.handle(validPayload);

    expect(createAdminClient).toHaveBeenCalled();
    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'jane.doe@example.com',
      'Appointment Confirmed – Samson Dental Center',
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
