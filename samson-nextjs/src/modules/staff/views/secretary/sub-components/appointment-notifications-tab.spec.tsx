/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppointmentNotificationsTab } from './appointment-notifications-tab';
import { getEmailLogsByAppointmentAction } from '@/modules/emails/actions/logs/get-email-logs-by-appointment.action';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';

vi.mock('server-only', () => ({}));
vi.mock('@/components/feedback/toast-container', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock('@/modules/appointments/actions/status/update-confirmation-channel.action', () => ({
  updateConfirmationChannelAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/status/resend-notification.action', () => ({
  resendNotificationAction: vi.fn(),
}));
vi.mock('@/modules/emails/actions/logs/get-email-logs-by-appointment.action', () => ({
  getEmailLogsByAppointmentAction: vi.fn(),
}));
vi.mock('@/modules/emails/actions/logs/get-outbox-log-by-id.action', () => ({
  getOutboxLogByIdAction: vi.fn(),
}));

describe('AppointmentNotificationsTab', () => {
  it('resets reminder status to PENDING for a rescheduled appointment even if older logs exist', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateStr = futureDate.toISOString().split('T')[0];
    const startTimeStr = `${dateStr}T09:00:00Z`;
    const endTimeStr = `${dateStr}T09:30:00Z`;

    const rescheduledAppointment: AppointmentDto = {
      id: 'appt-123',
      patientId: 'patient-1',
      serviceId: 'service-1',
      doctorId: 'doctor-1',
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      status: 'APPROVED',
      source: 'SELF_BOOKED',
      doctorAssignmentSource: 'SYSTEM',
      rescheduleCount: 1,
      confirmationChannel: 'EMAIL',
      emailConfirmationSent: true,
      smsConfirmationSent: false,
      emailReminder48hSent: false,
      smsReminder48hSent: false,
      emailReminder24hSent: false,
      smsReminder24hSent: false,
      emailCheckoutSent: false,
      smsCheckoutSent: false,
      emailCancelSent: false,
      smsCancelSent: false,
      emailRescheduleSent: true,
      smsRescheduleSent: false,
      paymentReceiptSent: false,
      createdAt: '2026-08-01T08:00:00Z',
      updatedAt: '2026-08-10T09:30:00Z', // Rescheduled today at 09:30
      patient: { id: 'patient-1', firstName: 'Juan', lastName: 'Luna', email: 'juan@example.com', phone: '09123456789' },
      service: { id: 'service-1', name: 'General Consultation', durationMinutes: 30 },
      statusHistory: [
        {
          id: 'hist-1',
          previousStatus: 'APPROVED',
          newStatus: 'APPROVED',
          reason: 'Patient requested reschedule',
          createdAt: '2026-08-10T09:30:00Z',
          actorRole: 'STAFF',
        },
      ],
    } as any;

    // Outbox logs contain:
    // 1. A RESCHEDULE_BOOKING log from today (2026-08-10 09:30)
    // 2. An OLD APPOINTMENT_REMINDER_48H log from August 4 (for the old slot)
    const logs = [
      {
        id: 'log-reschedule-1',
        eventType: 'RESCHEDULE_BOOKING',
        status: 'PROCESSED',
        payload: { appointmentId: 'appt-123', email: 'juan@example.com' },
        createdAt: '2026-08-10T09:30:00Z',
        retryCount: 0,
        errorLogs: null,
      },
      {
        id: 'log-reminder-old',
        eventType: 'APPOINTMENT_REMINDER_48H',
        status: 'PROCESSED',
        payload: { appointmentId: 'appt-123', email: 'juan@example.com' },
        createdAt: '2026-08-04T08:00:00Z', // Sent before reschedule
        retryCount: 0,
        errorLogs: null,
      },
    ];

    vi.mocked(getEmailLogsByAppointmentAction).mockResolvedValue({
      success: true,
      data: logs as any,
    });

    render(<AppointmentNotificationsTab appointment={rescheduledAppointment} view={{}} />);

    await waitFor(() => {
      expect(screen.getByText('Notification Lifecycle')).toBeDefined();
    });

    // Reschedule Notice should be present in Lifecycle and Timeline
    expect(screen.getAllByText('Reschedule Notice').length).toBeGreaterThanOrEqual(1);

    // 48-Hour Reminder in lifecycle should NOT be stuck at SENT for the new slot; it should be PENDING
    const reminder48Elements = screen.getAllByText('48-Hour Reminder');
    expect(reminder48Elements.length).toBeGreaterThanOrEqual(1);
    const lifecycle48Row = reminder48Elements[0].closest('div');
    expect(lifecycle48Row?.textContent).toContain('Email: PENDING');

    // 24-Hour Reminder in lifecycle should also be PENDING
    const reminder24Elements = screen.getAllByText('24-Hour Reminder');
    expect(reminder24Elements.length).toBeGreaterThanOrEqual(1);
    const lifecycle24Row = reminder24Elements[0].closest('div');
    expect(lifecycle24Row?.textContent).toContain('Email: PENDING');
  });

  it('renders Reschedule Notice as SENT when appointment has emailRescheduleSent flag', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().split('T')[0];

    const rescheduledAppt: AppointmentDto = {
      id: 'appt-456',
      patientId: 'patient-1',
      serviceId: 'service-2',
      doctorId: 'doctor-2',
      date: dateStr,
      startTime: `${dateStr}T14:00:00Z`,
      endTime: `${dateStr}T14:45:00Z`,
      status: 'APPROVED',
      source: 'SELF_BOOKED',
      doctorAssignmentSource: 'SYSTEM',
      rescheduleCount: 1,
      confirmationChannel: 'EMAIL',
      emailConfirmationSent: true,
      smsConfirmationSent: false,
      emailReminder48hSent: false,
      smsReminder48hSent: false,
      emailReminder24hSent: false,
      smsReminder24hSent: false,
      emailCheckoutSent: false,
      smsCheckoutSent: false,
      emailCancelSent: false,
      smsCancelSent: false,
      emailRescheduleSent: true,
      smsRescheduleSent: false,
      paymentReceiptSent: false,
      createdAt: '2026-08-01T08:00:00Z',
      updatedAt: '2026-08-10T10:00:00Z',
      patient: { id: 'patient-1', firstName: 'Maria', lastName: 'Clara', email: 'maria@example.com', phone: '09123456789' },
      service: { id: 'service-2', name: 'Teeth Cleaning & Scaling', durationMinutes: 45 },
      statusHistory: [],
    } as any;

    vi.mocked(getEmailLogsByAppointmentAction).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<AppointmentNotificationsTab appointment={rescheduledAppt} view={{}} />);

    await waitFor(() => {
      expect(screen.getAllByText('Notification Lifecycle').length).toBeGreaterThanOrEqual(1);
    });

    const rescheduleNotices = screen.getAllByText('Reschedule Notice');
    expect(rescheduleNotices.length).toBeGreaterThanOrEqual(1);
    const row = rescheduleNotices[0].closest('div');
    expect(row?.textContent).toContain('Email: SENT');
  });
});
