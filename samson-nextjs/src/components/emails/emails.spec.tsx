import { describe, it, expect } from 'vitest';
import { render } from '@react-email/components';
import React from 'react';
import SignupOtpEmail from './signup-otp-email';
import ResetPasswordOtpEmail from './reset-password-otp-email';
import AppointmentRequestReceivedEmail from './appointment-request-received-email';
import AppointmentConfirmedEmail from './appointment-confirmed-email';

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
    expect(html).toContain('Teeth Cleaning');
    expect(html).toContain('Dr. Jane Smith');
    expect(html).toContain('da95a63c-333e-4b68-98e3-82bdf1a07bd1');
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
    expect(html).toContain('Spouse');
    expect(html).toContain('Christopher Picardo');
    expect(html).toContain('da95a63c-333e-4b68-98e3-82bdf1a07bd2');
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
    expect(html).toContain('da95a63c-333e-4b68-98e3-82bdf1a07bd3');
  });
});
