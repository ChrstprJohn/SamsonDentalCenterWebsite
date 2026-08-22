import { describe, it, expect } from 'vitest';
import { render } from '@react-email/components';
import React from 'react';
import SignupOtpEmail from './signup-otp-email';
import ResetPasswordOtpEmail from './reset-password-otp-email';
import AppointmentRequestReceivedEmail from './appointment-request-received-email';
import AppointmentConfirmedEmail from './appointment-confirmed-email';
import AppointmentReminderEmail from './appointment-reminder-email';
import AppointmentCancelledEmail from './appointment-cancelled-email';
import AppointmentRescheduledEmail from './appointment-rescheduled-email';
import StaffReplyEmail from './staff-reply-email';
import PostCareEmail from './post-care-email';
import CheckoutFollowUpEmail from './checkout-follow-up-email';
import RequestRejectedEmail from './request-rejected-email';
import NoShowEmail from './no-show-email';

describe('Email Templates Rendering', () => {
  it('renders SignupOtpEmail without crashing', async () => {
    const html = await render(
      React.createElement(SignupOtpEmail, {
        firstName: 'John',
        otpCode: '123456',
      })
    );
    expect(html).toContain('123456');
    expect(html).toContain('John');
  });

  it('renders ResetPasswordOtpEmail without crashing', async () => {
    const html = await render(
      React.createElement(ResetPasswordOtpEmail, {
        firstName: 'Jane',
        otpCode: '654321',
      })
    );
    expect(html).toContain('654321');
    expect(html).toContain('Jane');
  });

  it('renders AppointmentRequestReceivedEmail without crashing (self booking)', async () => {
    const html = await render(
      React.createElement(AppointmentRequestReceivedEmail, {
        accountHolderName: 'Bob Smith',
        patientType: 'SELF',
        patientName: 'Bob Smith',
        serviceName: 'Teeth Cleaning',
        doctorName: 'Dr. Jane Smith',
        dateStr: 'Jun 4, 2026',
        timeRangeStr: '09:00 AM - 09:30 AM',
        appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd1',
        dashboardUrl: 'http://localhost:3000/user',
      })
    );
    expect(html).toContain('Bob Smith');
    expect(html).toContain('Thank you for reaching out to Samson Dental Center');
    expect(html).toContain('DA95A63C');
  });

  it('renders AppointmentRequestReceivedEmail without crashing (dependent booking)', async () => {
    const html = await render(
      React.createElement(AppointmentRequestReceivedEmail, {
        accountHolderName: 'Christopher Picardo',
        patientType: 'DEPENDENT',
        patientName: 'Maria Picardo',
        relationship: 'Spouse',
        bookedByName: 'Christopher Picardo',
        serviceName: 'Composite Filling',
        doctorName: 'Dr. John Smith',
        dateStr: 'Jun 4, 2026',
        timeRangeStr: '09:30 AM - 10:00 AM',
        appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
        dashboardUrl: 'http://localhost:3000/user',
      })
    );
    expect(html).toContain('Maria Picardo');
    expect(html).toContain('Thank you for reaching out to Samson Dental Center');
    expect(html).toContain('DA95A63C');
  });

  it('renders AppointmentConfirmedEmail without crashing', async () => {
    const html = await render(
      React.createElement(AppointmentConfirmedEmail, {
        patientName: 'Alice Guest',
        serviceName: 'Teeth Whitening',
        doctorName: 'Dr. John Doe',
        dateStr: 'Jun 25, 2026',
        timeRangeStr: '10:00 AM - 11:00 AM',
        appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
      })
    );
    expect(html).toContain('Alice Guest');
    expect(html).toContain('Teeth Whitening');
    expect(html).toContain('Dr. John Doe');
    expect(html).toContain('DA95A63C');
  });

  it('renders AppointmentReminderEmail without crashing', async () => {
    const html = await render(
      React.createElement(AppointmentReminderEmail, {
        reminderTitle: '24-hour Reminder',
        patientName: 'Alice Guest',
        serviceName: 'Teeth Cleaning',
        doctorName: 'Dr. Adrian Samson',
        dateStr: 'Monday, June 22, 2026',
        timeRangeStr: '2:00 PM – 2:45 PM',
        appointmentId: 'APT-SAMPLE',
      })
    );
    expect(html).toContain('Alice Guest');
    expect(html).toContain('tomorrow');
    expect(html).toContain('APT-SAMPLE');
  });

  it('renders AppointmentCancelledEmail without crashing', async () => {
    const html = await render(
      React.createElement(AppointmentCancelledEmail, {
        patientName: 'Alice Guest',
        serviceName: 'Teeth Whitening',
        dateStr: 'Jun 25, 2026',
        timeRangeStr: '10:00 AM - 11:00 AM',
        appointmentId: 'APT-SAMPLE',
        cancellationReason: 'Clinic schedule conflict.',
      })
    );
    expect(html).toContain('Alice Guest');
    expect(html).toContain('cancelled');
    expect(html).toContain('Clinic schedule conflict.');
  });

  it('renders AppointmentRescheduledEmail without crashing', async () => {
    const html = await render(
      React.createElement(AppointmentRescheduledEmail, {
        patientName: 'Alice Guest',
        serviceName: 'Teeth Whitening',
        doctorName: 'Dr. John Doe',
        oldDoctorName: 'Dr. Previous Dentist',
        oldDateStr: 'Jun 15, 2026',
        dateStr: 'Jun 25, 2026',
        timeRangeStr: '10:00 AM - 11:00 AM',
        appointmentId: 'APT-SAMPLE',
        rescheduleReason: 'Patient request',
      })
    );
    expect(html).toContain('Alice Guest');
    expect(html).toContain('rescheduled');
    expect(html).toContain('Previously scheduled:');
    expect(html).toContain('Dr. Previous Dentist');
  });

  it('renders StaffReplyEmail without crashing', async () => {
    const html = await render(
      React.createElement(StaffReplyEmail, {
        patientName: 'Alice Guest',
        chatToken: 'token123',
      })
    );
    expect(html).toContain('Alice Guest');
    expect(html).toContain('sent an update');
  });

  it('renders PostCareEmail without crashing', async () => {
    const html = await render(
      React.createElement(PostCareEmail, {
        patientName: 'Alice Guest',
        serviceName: 'Dental Cleaning',
        doctorName: 'Dr. Adrian Samson',
        dateStr: 'Monday, June 22, 2026',
        appointmentId: 'APT-SAMPLE-123',
      })
    );
    expect(html).toContain('Alice Guest');
    expect(html).toContain('Dental Cleaning');
    expect(html).toContain('APT-SAMPLE-123');
  });

  it('renders CheckoutFollowUpEmail without crashing', async () => {
    const html = await render(
      React.createElement(CheckoutFollowUpEmail, {
        patientName: 'Alice Guest',
        serviceName: 'Dental Cleaning',
        doctorName: 'Dr. Adrian Samson',
        dateStr: 'Monday, June 22, 2026',
        appointmentId: 'APT-SAMPLE-789',
      })
    );
    expect(html).toContain('Alice Guest');
    expect(html).toContain('Dental Cleaning');
    expect(html).toContain('APT-SAMPLE-789');
  });

  it('renders RequestRejectedEmail without crashing', async () => {
    const html = await render(
      React.createElement(RequestRejectedEmail, {
        patientName: 'Alice Guest',
        rejectionReason: 'Fully booked on requested date',
      })
    );
    expect(html).toContain('Alice Guest');
    expect(html).toContain('Fully booked on requested date');
  });

  it('renders NoShowEmail without crashing', async () => {
    const html = await render(
      React.createElement(NoShowEmail, {
        patientName: 'Alice Guest',
        serviceName: 'Dental Cleaning',
        doctorName: 'Dr. Adrian Samson',
        dateStr: 'Monday, June 22, 2026',
        timeRangeStr: '2:00 PM - 2:45 PM',
        appointmentId: 'APT-SAMPLE-456',
      })
    );
    expect(html).toContain('Alice Guest');
    expect(html).toContain('Dental Cleaning');
    expect(html).toContain('Missed');
    expect(html).toContain('APT-SAMPLE-456');
  });

  it('resolves direct image URLs without proxy endpoint in resolveEmailBranding', async () => {
    const { resolveEmailBranding } = await import('./email-branding');
    const branding = resolveEmailBranding({
      clinicName: 'Test Clinic',
      emailLogoUrl: 'https://example.com/direct-logo.png',
      emailLogoDarkUrl: 'https://example.com/direct-dark-logo.png',
    });

    expect(branding.logoUrl).toBe('https://example.com/direct-logo.png');
    expect(branding.logoDarkUrl).toBe('https://example.com/direct-dark-logo.png');
    expect(branding.logoUrl).not.toContain('/api/assets/email-logo');
  });

  it('renders direct logo URL in appointment emails', async () => {
    const { resolveEmailBranding } = await import('./email-branding');
    const branding = resolveEmailBranding({
      clinicName: 'Test Clinic',
      emailLogoUrl: 'https://example.com/direct-logo.png',
    });

    const html = await render(
      React.createElement(AppointmentConfirmedEmail, {
        patientName: 'Alice Guest',
        serviceName: 'Dental Cleaning',
        branding,
      })
    );

    expect(html).toContain('src="https://example.com/direct-logo.png"');
    expect(html).not.toContain('/api/assets/email-logo');
  });

  it('renders direct logo URL in OTP emails with branding', async () => {
    const { resolveEmailBranding } = await import('./email-branding');
    const branding = resolveEmailBranding({
      clinicName: 'Test Clinic',
      emailLogoUrl: 'https://example.com/direct-logo.png',
    });

    const html = await render(
      React.createElement(ResetPasswordOtpEmail, {
        firstName: 'Jane',
        otpCode: '654321',
        branding,
      })
    );

    expect(html).toContain('src="https://example.com/direct-logo.png"');
  });
});


