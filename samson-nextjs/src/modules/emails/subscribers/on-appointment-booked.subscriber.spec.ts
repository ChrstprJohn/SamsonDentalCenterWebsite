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

  it('queries database and dispatches email for a SELF booking (no dependentId)', async () => {
    const validPayload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      patientId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
      doctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
      date: '2026-06-04',
      startTime: '2026-06-04T09:00:00.000Z',
      durationMinutes: 30,
      // dependentId omitted — self booking
    };

    mockSingle
      .mockResolvedValueOnce({
        data: { email: 'patient@example.com', first_name: 'John', last_name: 'Doe' },
        error: null,
      }) // patient
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

    await onAppointmentBookedSubscriber.handle(validPayload);

    expect(createAdminClient).toHaveBeenCalled();
    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      'Appointment Request Received – Samson Dental Center',
      'appointment_request_received',
      expect.objectContaining({
        accountHolderFirstName: 'John',
        patientType: 'SELF',
        patientName: 'John Doe',
        bookedByName: undefined,
        relationship: undefined,
        serviceName: 'Teeth Cleaning',
        doctorName: 'Dr. Jane Smith',
        dateStr: 'Jun 4, 2026',
        timeRangeStr: expectedTimeRange,
        appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      })
    );
  });

  it('queries database and dispatches email for a DEPENDENT booking (with dependentId)', async () => {
    const validPayload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      patientId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
      doctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
      date: '2026-06-04',
      startTime: '2026-06-04T09:00:00.000Z',
      durationMinutes: 30,
      dependentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
    };

    mockSingle
      .mockResolvedValueOnce({
        data: { email: 'patient@example.com', first_name: 'Christopher', last_name: 'Picardo' },
        error: null,
      }) // patient (account holder)
      .mockResolvedValueOnce({
        data: { name: 'Composite Filling' },
        error: null,
      }) // service
      .mockResolvedValueOnce({
        data: { first_name: 'John', last_name: 'Smith' },
        error: null,
      }) // doctor
      .mockResolvedValueOnce({
        data: { first_name: 'Maria', last_name: 'Picardo', relationship: 'SPOUSE' },
        error: null,
      }); // dependent

    const start = new Date(validPayload.startTime);
    const end = new Date(start.getTime() + validPayload.durationMinutes * 60000);
    const expectedTimeRange = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    await onAppointmentBookedSubscriber.handle(validPayload);

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      'Family Member Appointment Request Received – Samson Dental Center',
      'appointment_request_received',
      expect.objectContaining({
        accountHolderFirstName: 'Christopher',
        patientType: 'DEPENDENT',
        patientName: 'Maria Picardo',
        relationship: 'Spouse',
        bookedByName: 'Christopher Picardo',
        serviceName: 'Composite Filling',
        doctorName: 'Dr. John Smith',
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
