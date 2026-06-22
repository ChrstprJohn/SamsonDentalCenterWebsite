import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onManualBookingGuestSubscriber } from './on-manual-booking-guest.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';
import { formatClinicTime } from '@/shared/utils/date.util';
import { z } from 'zod';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onManualBookingGuestSubscriber', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect })) } as any;

  const validPayload = {
    appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
    serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
    doctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
    date: '2026-06-25',
    startTime: '2026-06-25T09:00:00.000Z',
    durationMinutes: 30,
    guestContactId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
    guestName: 'Jane Doe',
    guestEmail: 'jane.doe@example.com',
    guestPhone: '+639123456789',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);
  });

  it('queries DB and sends confirmation email when guestEmail is present', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: { name: 'Teeth Cleaning' }, error: null })  // service
      .mockResolvedValueOnce({ data: { first_name: 'John', last_name: 'Smith' }, error: null }); // doctor

    const start = new Date(validPayload.startTime);
    const end = new Date(start.getTime() + validPayload.durationMinutes * 60000);
    const expectedTimeRange = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    await onManualBookingGuestSubscriber.handle(validPayload);

    expect(createAdminClient).toHaveBeenCalled();
    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'jane.doe@example.com',
      'Appointment Confirmed – Samson Dental Center',
      'appointment_confirmed',
      expect.objectContaining({
        patientName: 'Jane Doe',
        serviceName: 'Teeth Cleaning',
        doctorName: 'Dr. John Smith',
        dateStr: 'Jun 25, 2026',
        timeRangeStr: expectedTimeRange,
        appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      })
    );
  });

  it('skips email silently when guestEmail is null', async () => {
    await onManualBookingGuestSubscriber.handle({ ...validPayload, guestEmail: null });

    expect(createAdminClient).not.toHaveBeenCalled();
    expect(ResendService.sendTemplatedEmail).not.toHaveBeenCalled();
  });

  it('skips email silently when guestEmail is missing', async () => {
    const { guestEmail: _, ...withoutEmail } = validPayload;
    await onManualBookingGuestSubscriber.handle(withoutEmail);

    expect(createAdminClient).not.toHaveBeenCalled();
    expect(ResendService.sendTemplatedEmail).not.toHaveBeenCalled();
  });

  it('throws ZodError on invalid payload', async () => {
    await expect(
      onManualBookingGuestSubscriber.handle({ appointmentId: 'not-a-uuid' })
    ).rejects.toThrow(z.ZodError);
    expect(ResendService.sendTemplatedEmail).not.toHaveBeenCalled();
  });

  it('throws when service fetch fails', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

    await expect(
      onManualBookingGuestSubscriber.handle(validPayload)
    ).rejects.toThrow('Failed to fetch service');
  });

  it('throws when doctor fetch fails', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: { name: 'Teeth Cleaning' }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

    await expect(
      onManualBookingGuestSubscriber.handle(validPayload)
    ).rejects.toThrow('Failed to fetch doctor');
  });
});
