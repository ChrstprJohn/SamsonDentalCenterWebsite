import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onManualBookingPatientSubscriber } from './on-manual-booking-patient.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';
import { formatClinicTime } from '@/shared/utils/date.util';
import { z } from 'zod';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onManualBookingPatientSubscriber', () => {
  const validPayload = {
    appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
    patientId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
    serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
    doctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
    date: '2026-06-25',
    startTime: '2026-06-25T09:00:00.000Z',
    durationMinutes: 30,
  };

  function buildMockSupabase(singleResults: Array<{ data: any; error: any }>) {
    let callIndex = 0;
    const mockSingle = vi.fn().mockImplementation(() => Promise.resolve(singleResults[callIndex++] ?? { data: null, error: { message: 'Unexpected call' } }));
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    return { from: vi.fn(() => ({ select: mockSelect })) } as any;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches patient, service, doctor and sends email with account holder name (self booking)', async () => {
    const mockSupabase = buildMockSupabase([
      { data: { email: 'john@example.com', first_name: 'John', middle_name: null, last_name: 'Doe', suffix: null }, error: null },
      { data: { name: 'Teeth Cleaning' }, error: null },
      { data: { first_name: 'Jane', last_name: 'Smith' }, error: null },
    ]);
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);

    const start = new Date(validPayload.startTime);
    const end = new Date(start.getTime() + validPayload.durationMinutes * 60000);
    const expectedTimeRange = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    await onManualBookingPatientSubscriber.handle(validPayload);

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'john@example.com',
      'Appointment Confirmed – Samson Dental Center',
      'appointment_confirmed',
      expect.objectContaining({
        patientName: 'John Doe',
        serviceName: 'Teeth Cleaning',
        doctorName: 'Dr. Jane Smith',
        dateStr: 'Jun 25, 2026',
        timeRangeStr: expectedTimeRange,
        appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      })
    );
  });

  it('uses dependentName in email when booking is for a dependent', async () => {
    const mockSupabase = buildMockSupabase([
      { data: { email: 'john@example.com', first_name: 'John', middle_name: null, last_name: 'Santos', suffix: null }, error: null },
      { data: { name: 'Teeth Cleaning' }, error: null },
      { data: { first_name: 'Jane', last_name: 'Smith' }, error: null },
    ]);
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);

    const payloadWithDependent = {
      ...validPayload,
      dependentId: 'a1b07384-d113-4ec2-a5e6-ec083b0f5cc9',   // valid UUID v4
      dependentName: 'Maria Santos',
    };

    await onManualBookingPatientSubscriber.handle(payloadWithDependent);

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'john@example.com',
      'Appointment Confirmed – Samson Dental Center',
      'appointment_confirmed',
      expect.objectContaining({ patientName: 'Maria Santos' })
    );
  });

  it('throws ZodError on invalid payload', async () => {
    vi.mocked(createAdminClient).mockResolvedValue(buildMockSupabase([]));
    await expect(
      onManualBookingPatientSubscriber.handle({ appointmentId: 'not-a-uuid' })
    ).rejects.toThrow(z.ZodError);
    expect(ResendService.sendTemplatedEmail).not.toHaveBeenCalled();
  });

  it('throws when patient fetch fails', async () => {
    const mockSupabase = buildMockSupabase([
      { data: null, error: { message: 'Not found' } },
    ]);
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);

    await expect(
      onManualBookingPatientSubscriber.handle(validPayload)
    ).rejects.toThrow('Failed to fetch patient');
  });

  it('throws when service fetch fails', async () => {
    const mockSupabase = buildMockSupabase([
      { data: { email: 'john@example.com', first_name: 'John', middle_name: null, last_name: 'Doe', suffix: null }, error: null },
      { data: null, error: { message: 'Not found' } },
    ]);
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);

    await expect(
      onManualBookingPatientSubscriber.handle(validPayload)
    ).rejects.toThrow('Failed to fetch service');
  });

  it('throws when doctor fetch fails', async () => {
    const mockSupabase = buildMockSupabase([
      { data: { email: 'john@example.com', first_name: 'John', middle_name: null, last_name: 'Doe', suffix: null }, error: null },
      { data: { name: 'Teeth Cleaning' }, error: null },
      { data: null, error: { message: 'Not found' } },
    ]);
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);

    await expect(
      onManualBookingPatientSubscriber.handle(validPayload)
    ).rejects.toThrow('Failed to fetch doctor');
  });
});
