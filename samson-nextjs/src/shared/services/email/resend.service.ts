import 'server-only';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import React from 'react';
import SignupOtpEmail from '@/components/emails/signup-otp-email';
import ResetPasswordOtpEmail from '@/components/emails/reset-password-otp-email';
import AppointmentRequestReceivedEmail from '@/components/emails/appointment-request-received-email';
import AppointmentConfirmedEmail from '@/components/emails/appointment-confirmed-email';

if (!process.env.RESEND_API_KEY) {
  // We don't throw an error at boot, but we will throw when attempting to send if missing.
  console.warn('Missing RESEND_API_KEY environment variable. Emails will fail to send.');
}

const resend = new Resend(process.env.RESEND_API_KEY || 're_test_123');

// Define a type mapping for all possible templates
type EmailTemplates = {
  'signup_otp': { firstName: string; otpCode: string };
  'reset_password_otp': { firstName: string; otpCode: string };
  'appointment_request_received': {
    accountHolderName: string;
    patientType: 'SELF' | 'DEPENDENT';
    patientName: string;
    relationship?: string;
    bookedByName?: string;
    serviceName: string;
    doctorName: string;
    dateStr: string;
    timeRangeStr: string;
    appointmentId: string;
    dashboardUrl: string;
  };
  'appointment_confirmed': {
    patientName: string;
    serviceName: string;
    doctorName: string;
    dateStr: string;
    timeRangeStr: string;
    appointmentId: string;
  };
};

export const ResendService = {
  /**
   * Renders the requested template and sends it via Resend.
   */
  async sendTemplatedEmail<K extends keyof EmailTemplates>(
     to: string,
     subject: string,
     templateName: K,
     payload: EmailTemplates[K]
  ) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    let html = '';

    // Render the appropriate React Email component to an HTML string
    switch (templateName) {
      case 'signup_otp': {
        const otpPayload = payload as EmailTemplates['signup_otp'];
        // Note: render returns a Promise in newer react-email versions if using suspense, 
        // but typically synchronous for basic templates. Await to be safe.
        html = await render(React.createElement(SignupOtpEmail, { 
          firstName: otpPayload.firstName, 
          otpCode: otpPayload.otpCode 
        }));
        break;
      }
      case 'reset_password_otp': {
        const resetPayload = payload as EmailTemplates['reset_password_otp'];
        html = await render(React.createElement(ResetPasswordOtpEmail, { 
          firstName: resetPayload.firstName, 
          otpCode: resetPayload.otpCode 
        }));
        break;
      }
      case 'appointment_request_received': {
        const reqPayload = payload as EmailTemplates['appointment_request_received'];
        html = await render(React.createElement(AppointmentRequestReceivedEmail, {
          accountHolderName: reqPayload.accountHolderName,
          patientType: reqPayload.patientType,
          patientName: reqPayload.patientName,
          relationship: reqPayload.relationship,
          bookedByName: reqPayload.bookedByName,
          serviceName: reqPayload.serviceName,
          doctorName: reqPayload.doctorName,
          dateStr: reqPayload.dateStr,
          timeRangeStr: reqPayload.timeRangeStr,
          appointmentId: reqPayload.appointmentId,
          dashboardUrl: reqPayload.dashboardUrl,
        }));
        break;
      }
      case 'appointment_confirmed': {
        const reqPayload = payload as EmailTemplates['appointment_confirmed'];
        html = await render(React.createElement(AppointmentConfirmedEmail, {
          patientName: reqPayload.patientName,
          serviceName: reqPayload.serviceName,
          doctorName: reqPayload.doctorName,
          dateStr: reqPayload.dateStr,
          timeRangeStr: reqPayload.timeRangeStr,
          appointmentId: reqPayload.appointmentId,
        }));
        break;
      }
      default:
        throw new Error(`Unknown email template: ${templateName}`);
    }

    // Determine sender address (use onboarding or production domain)
    // For Resend testing without a domain, you can only send to yourself, 
    // or use onboarding@resend.dev (which Resend only allows sending to the registered account email)
    const fromAddress = process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: `Samson Dental <${fromAddress}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend API Error: ${error.message}`);
    }

    return data;
  }
};
