import 'server-only';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import React from 'react';
import SignupOtpEmail from '@/components/emails/signup-otp-email';

if (!process.env.RESEND_API_KEY) {
  // We don't throw an error at boot, but we will throw when attempting to send if missing.
  console.warn('Missing RESEND_API_KEY environment variable. Emails will fail to send.');
}

const resend = new Resend(process.env.RESEND_API_KEY || 're_test_123');

// Define a type mapping for all possible templates
type EmailTemplates = {
  'signup_otp': { firstName: string; otpCode: string };
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
      case 'signup_otp':
        const otpPayload = payload as EmailTemplates['signup_otp'];
        // Note: render returns a Promise in newer react-email versions if using suspense, 
        // but typically synchronous for basic templates. Await to be safe.
        html = await render(React.createElement(SignupOtpEmail, { 
          firstName: otpPayload.firstName, 
          otpCode: otpPayload.otpCode 
        }));
        break;
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
