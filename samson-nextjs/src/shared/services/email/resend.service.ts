import 'server-only';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import React from 'react';
import SignupOtpEmail from '@/components/emails/signup-otp-email';
import ResetPasswordOtpEmail from '@/components/emails/reset-password-otp-email';
import AppointmentRequestReceivedEmail from '@/components/emails/appointment-request-received-email';
import AppointmentConfirmedEmail from '@/components/emails/appointment-confirmed-email';
import AppointmentCancelledEmail from '@/components/emails/appointment-cancelled-email';
import AppointmentRescheduledEmail from '@/components/emails/appointment-rescheduled-email';
import StaffReplyEmail from '@/components/emails/staff-reply-email';
import AppointmentReminderEmail from '@/components/emails/appointment-reminder-email';
import PostCareEmail from '@/components/emails/post-care-email';
import RequestRejectedEmail from '@/components/emails/request-rejected-email';
import NoShowEmail from '@/components/emails/no-show-email';
import { EmailBranding, resolveEmailBranding } from '@/components/emails/email-branding';
import { createAdminClient } from '@/shared/database/server';
import { getClinicConfigQuery } from '@/modules/clinic-config/repositories/settings/clinic-config.queries';
import { getClinicConfigUseCase } from '@/modules/clinic-config/use-cases/settings/get-clinic-config.use-case';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

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
    patientType?: 'SELF' | 'DEPENDENT';
    patientName: string;
    relationship?: string;
    bookedByName?: string;
    serviceName: string;
    doctorName?: string;
    dateStr: string;
    timeRangeStr?: string;
    preferredStartTimeStr?: string;
    appointmentId: string;
    patientNote?: string;
    dashboardUrl?: string;
    baseUrl?: string;
  };
  'appointment_confirmed': {
    patientName: string;
    serviceName: string;
    doctorName: string;
    dateStr: string;
    timeRangeStr: string;
    appointmentId: string;
    approvalReason?: string;
    chatToken?: string;
    baseUrl?: string;
  };
  'appointment_reminder': {
    reminderTitle?: string;
    patientName: string;
    serviceName: string;
    doctorName: string;
    dateStr: string;
    timeRangeStr: string;
    appointmentId: string;
    chatToken?: string;
    baseUrl?: string;
  };
  'appointment_cancelled': {
    patientName: string;
    serviceName?: string;
    dateStr: string;
    timeRangeStr?: string;
    appointmentId?: string;
    cancellationReason?: string;
    rebookUrl?: string;
    baseUrl?: string;
  };
  'appointment_rescheduled': {
    patientName: string;
    dateStr: string;
    timeRangeStr: string;
    doctorName?: string;
    serviceName?: string;
    oldDoctorName?: string;
    oldServiceName?: string;
    oldDateStr?: string;
    oldTimeRangeStr?: string;
    appointmentId?: string;
    rescheduleReason?: string;
    chatToken?: string;
    baseUrl?: string;
  };
  'staff_reply': {
    patientName: string;
    chatToken: string;
    baseUrl: string;
  };
  'post_care': {
    patientName: string;
    serviceName?: string;
    doctorName?: string;
    dateStr?: string;
    appointmentId?: string;
    baseUrl?: string;
  };
  'request_rejected': {
    patientName: string;
    serviceName?: string;
    dateStr?: string;
    timeRangeStr?: string;
    preferredStartTimeStr?: string;
    appointmentId?: string;
    rejectionReason?: string;
    rebookUrl?: string;
    baseUrl?: string;
  };
  'appointment_no_show': {
    patientName: string;
    serviceName?: string;
    doctorName?: string;
    dateStr?: string;
    timeRangeStr?: string;
    appointmentId?: string;
    baseUrl?: string;
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

    // Resolve clinic branding (name, logo, phone, address, website) from Clinic Settings.
    // Falls back to the previous hardcoded values when config is missing.
    let branding: EmailBranding | null = null;
    try {
      if (templateName !== 'signup_otp' && templateName !== 'reset_password_otp') {
        const supabase = await createAdminClient();
        const config = await getClinicConfigUseCase(getClinicConfigQuery(supabase))();
        branding = resolveEmailBranding(config, getBaseUrl());
      }
    } catch (err) {
      console.warn('Failed to load clinic branding for email, using defaults:', err);
    }

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
          dateStr: reqPayload.dateStr,
          timeRangeStr: reqPayload.timeRangeStr,
          preferredStartTimeStr: reqPayload.preferredStartTimeStr,
          appointmentId: reqPayload.appointmentId,
          patientNote: reqPayload.patientNote,
          dashboardUrl: reqPayload.dashboardUrl,
          baseUrl: reqPayload.baseUrl,
          branding: branding || undefined,
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
          approvalReason: reqPayload.approvalReason,
          chatToken: reqPayload.chatToken,
          baseUrl: reqPayload.baseUrl,
          branding: branding || undefined,
        }));
        break;
      }
      case 'appointment_reminder': {
        const reqPayload = payload as EmailTemplates['appointment_reminder'];
        html = await render(React.createElement(AppointmentReminderEmail, {
          reminderTitle: reqPayload.reminderTitle,
          patientName: reqPayload.patientName,
          serviceName: reqPayload.serviceName,
          doctorName: reqPayload.doctorName,
          dateStr: reqPayload.dateStr,
          timeRangeStr: reqPayload.timeRangeStr,
          appointmentId: reqPayload.appointmentId,
          chatToken: reqPayload.chatToken,
          baseUrl: reqPayload.baseUrl,
          branding: branding || undefined,
        }));
        break;
      }
      case 'appointment_cancelled': {
        const reqPayload = payload as EmailTemplates['appointment_cancelled'];
        html = await render(React.createElement(AppointmentCancelledEmail, {
          patientName: reqPayload.patientName,
          serviceName: reqPayload.serviceName,
          dateStr: reqPayload.dateStr,
          timeRangeStr: reqPayload.timeRangeStr,
          appointmentId: reqPayload.appointmentId,
          cancellationReason: reqPayload.cancellationReason,
          rebookUrl: reqPayload.rebookUrl,
          baseUrl: reqPayload.baseUrl,
          branding: branding || undefined,
        }));
        break;
      }
      case 'appointment_rescheduled': {
        const reqPayload = payload as EmailTemplates['appointment_rescheduled'];
        html = await render(React.createElement(AppointmentRescheduledEmail, {
          patientName: reqPayload.patientName,
          serviceName: reqPayload.serviceName,
          doctorName: reqPayload.doctorName,
          oldDoctorName: reqPayload.oldDoctorName,
          oldServiceName: reqPayload.oldServiceName,
          oldDateStr: reqPayload.oldDateStr,
          oldTimeRangeStr: reqPayload.oldTimeRangeStr,
          dateStr: reqPayload.dateStr,
          timeRangeStr: reqPayload.timeRangeStr,
          appointmentId: reqPayload.appointmentId,
          rescheduleReason: reqPayload.rescheduleReason,
          chatToken: reqPayload.chatToken,
          baseUrl: reqPayload.baseUrl,
          branding: branding || undefined,
        }));
        break;
      }
      case 'staff_reply': {
        const reqPayload = payload as EmailTemplates['staff_reply'];
        html = await render(React.createElement(StaffReplyEmail, {
          patientName: reqPayload.patientName,
          chatToken: reqPayload.chatToken,
          baseUrl: reqPayload.baseUrl,
          branding: branding || undefined,
        }));
        break;
      }
      case 'post_care': {
        const reqPayload = payload as EmailTemplates['post_care'];
        html = await render(React.createElement(PostCareEmail, {
          patientName: reqPayload.patientName,
          serviceName: reqPayload.serviceName,
          doctorName: reqPayload.doctorName,
          dateStr: reqPayload.dateStr,
          appointmentId: reqPayload.appointmentId,
          baseUrl: reqPayload.baseUrl,
          branding: branding || undefined,
        }));
        break;
      }
      case 'request_rejected': {
        const reqPayload = payload as EmailTemplates['request_rejected'];
        html = await render(React.createElement(RequestRejectedEmail, {
          patientName: reqPayload.patientName,
          serviceName: reqPayload.serviceName,
          dateStr: reqPayload.dateStr,
          timeRangeStr: reqPayload.timeRangeStr,
          preferredStartTimeStr: reqPayload.preferredStartTimeStr,
          appointmentId: reqPayload.appointmentId,
          rejectionReason: reqPayload.rejectionReason,
          rebookUrl: reqPayload.rebookUrl,
          baseUrl: reqPayload.baseUrl,
          branding: branding || undefined,
        }));
        break;
      }
      case 'appointment_no_show': {
        const reqPayload = payload as EmailTemplates['appointment_no_show'];
        html = await render(React.createElement(NoShowEmail, {
          patientName: reqPayload.patientName,
          serviceName: reqPayload.serviceName,
          doctorName: reqPayload.doctorName,
          dateStr: reqPayload.dateStr,
          timeRangeStr: reqPayload.timeRangeStr,
          appointmentId: reqPayload.appointmentId,
          baseUrl: reqPayload.baseUrl,
          branding: branding || undefined,
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
    const senderName = branding?.clinicName || process.env.RESEND_SENDER_NAME || 'Samson Dental Center';

    const { data, error } = await resend.emails.send({
      from: `${senderName} <${fromAddress}>`,
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
