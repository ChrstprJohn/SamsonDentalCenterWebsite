import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onAppointmentBookedSubscriber } from './on-appointment-booked.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';
import { formatClinicTime } from '@/shared/utils/date.util';
import { z } from 'zod';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onAppointmentBookedSubscriber', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect })) } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);
  });

  it('queries database and dispatches templated email on valid payload', async () => {
    const validPayload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      patientId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
      doctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
      date: '2026-06-04',
      startTime: '2026-06-04T09:00:00.000Z',
      durationMinutes: 30,
    };

    // Return different mock values based on table name queried:
    mockSingle
      .mockResolvedValueOnce({
        data: { email: 'patient@example.com', first_name: 'John', last_name: 'Doe' },
        error: null,
      }) // patient details
      .mockResolvedValueOnce({
        data: { name: 'Teeth Cleaning' },
        error: null,
      }) // service details
      .mockResolvedValueOnce({
        data: { first_name: 'Jane', last_name: 'Smith' },
        error: null,
      }); // doctor details

    const start = new Date(validPayload.startTime);
    const end = new Date(start.getTime() + validPayload.durationMinutes * 60000);
    const expectedTimeRange = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    await onAppointmentBookedSubscriber.handle(validPayload);

    expect(createAdminClient).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
    expect(mockSupabase.from).toHaveBeenCalledWith('services');
    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      'We Received Your Appointment Request',
      'appointment_booked',
      expect.objectContaining({
        patientName: 'John Doe',
        serviceName: 'Teeth Cleaning',
        doctorName: 'Dr. Jane Smith',
        dateStr: 'Jun 4, 2026',
        timeRangeStr: expectedTimeRange,
        appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      })
    );
  });

  it('throws ZodError on invalid payload', async () => {
    const invalidPayload = {
      appointmentId: 'not-a-uuid',
    };

    await expect(onAppointmentBookedSubscriber.handle(invalidPayload)).rejects.toThrow(z.ZodError);
    expect(ResendService.sendTemplatedEmail).not.toHaveBeenCalled();
  });
});
