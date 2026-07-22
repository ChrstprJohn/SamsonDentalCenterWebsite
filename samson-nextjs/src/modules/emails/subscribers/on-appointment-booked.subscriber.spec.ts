import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onAppointmentBookedSubscriber } from './on-appointment-booked.subscriber';
import { ResendService } from '@/shared/services/email/resend.service';
import { createAdminClient } from '@/shared/database/server';
import { formatClinicTime, calculateEndTime } from '@/shared/utils/date.util';
import { z } from 'zod';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/email/resend.service');
vi.mock('@/shared/database/server');

describe('onAppointmentBookedSubscriber', () => {
  const mockSingle = vi.fn();
  const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect, update: mockUpdate })) } as any;

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
      startTime: '09:00',
      durationMinutes: 30,
      // dependentId omitted — self booking
    };

    mockSingle
      .mockResolvedValueOnce({
        data: { email: 'patient@example.com', first_name: 'John', middle_name: 'A.', last_name: 'Doe', suffix: 'Jr.' },
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

    const start = validPayload.startTime;
    const end = calculateEndTime(start, validPayload.durationMinutes);
    const expectedTimeRange = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;


    await onAppointmentBookedSubscriber.handle(validPayload);

    expect(createAdminClient).toHaveBeenCalled();
    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      'Appointment Request Received – Samson Dental Center',
      'appointment_request_received',
      expect.objectContaining({
        accountHolderName: 'John A. Doe Jr.',
        patientType: 'SELF',
        patientName: 'John A. Doe Jr.',
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
      startTime: '09:00',
      durationMinutes: 30,
      dependentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
    };

    mockSingle
      .mockResolvedValueOnce({
        data: { email: 'patient@example.com', first_name: 'Christopher', middle_name: 'John', last_name: 'Picardo', suffix: 'Sr.' },
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
        data: { first_name: 'Maria', middle_name: 'Elena', last_name: 'Picardo', suffix: 'Jr.', relationship: 'SPOUSE' },
        error: null,
      }); // dependent

    const start = validPayload.startTime;
    const end = calculateEndTime(start, validPayload.durationMinutes);
    const expectedTimeRange = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;


    await onAppointmentBookedSubscriber.handle(validPayload);

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      'Family Member Appointment Request Received – Samson Dental Center',
      'appointment_request_received',
      expect.objectContaining({
        accountHolderName: 'Christopher John Picardo Sr.',
        patientType: 'DEPENDENT',
        patientName: 'Maria Elena Picardo Jr.',
        relationship: 'Spouse',
        bookedByName: 'Christopher John Picardo Sr.',
        serviceName: 'Composite Filling',
        doctorName: 'Dr. John Smith',
        dateStr: 'Jun 4, 2026',
        timeRangeStr: expectedTimeRange,
        appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      })
    );
  });

  it('handles null doctorId and null startTime gracefully', async () => {
    const payloadWithNulls = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
      patientId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
      doctorId: null,
      date: '2026-06-04',
      startTime: null,
    };

    mockSingle
      .mockResolvedValueOnce({
        data: { email: 'patient@example.com', first_name: 'John', middle_name: null, last_name: 'Doe', suffix: null },
        error: null,
      }) // patient
      .mockResolvedValueOnce({
        data: { name: 'Teeth Cleaning' },
        error: null,
      }); // service

    await onAppointmentBookedSubscriber.handle(payloadWithNulls);

    expect(ResendService.sendTemplatedEmail).toHaveBeenCalledWith(
      'patient@example.com',
      'Appointment Request Received – Samson Dental Center',
      'appointment_request_received',
      expect.objectContaining({
        doctorName: 'Assigned Dentist',
        timeRangeStr: 'To be scheduled',
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
