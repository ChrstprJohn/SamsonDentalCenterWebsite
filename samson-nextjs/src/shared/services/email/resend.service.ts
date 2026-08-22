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
import CheckoutFollowUpEmail from '@/components/emails/checkout-follow-up-email';
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

const DEFAULT_SENDER_EMAIL = 'noreply@samsondentalcenter-website.chrbuilds.dev';
const DEFAULT_BUSINESS_EMAIL = 'info@samsondentalcenter.com';
const DEFAULT_SENDER_NAME = 'Samson Dental Center';

/**
 * Options to customize email delivery (reply-to, bcc, sender domain, and threading headers).
 */
export interface SendEmailOptions {
  /** Custom sender address (e.g. `noreply@samsondentalcenter-website.chrbuilds.dev`) */
  from?: string;
  /** Custom sender display name (e.g. `Samson Dental Center`) */
  senderName?: string;
  /** Reply-to email address. Defaults to dynamic clinic business email */
  replyTo?: string | string[];
  /** Alias for replyTo */
  reply_to?: string | string[];
  /** Optional BCC address(es) */
  bcc?: string | string[];
  /** Optional CC address(es) */
  cc?: string | string[];
  /** Optional custom headers map */
  headers?: Record<string, string>;
  /**
   * In-Reply-To header for email threading (e.g. `<appointment-123@domain>`).
   * Automatically formatted with enclosing angle brackets if needed.
   */
  inReplyTo?: string;
  /**
   * References header for email threading.
   * Can be a single Message-ID or an array of Message-IDs.
   */
  references?: string | string[];
  /** Optional unique thread identifier (e.g. appointmentId or conversation UUID) */
  threadId?: string;
}

export interface SendGenericEmailParams extends SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

// Define a type mapping for all possible templates
export type EmailTemplates = {
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
  'checkout_follow_up': {
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

/**
 * Extracts sender domain (e.g. `samsondentalcenter-website.chrbuilds.dev`)
 * from an email string.
 */
function extractDomain(fromEmailOrAddress: string): string {
  const match = fromEmailOrAddress.match(/@([a-zA-Z0-9.-]+)/);
  return match ? match[1].replace(/>$/, '').trim() : 'samsondentalcenter-website.chrbuilds.dev';
}

/**
 * Formats a message-id ensuring it is wrapped in angle brackets `<id@domain>`.
 */
function formatMessageId(id: string): string {
  const trimmed = id.trim();
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return trimmed;
  }
  return `<${trimmed}>`;
}

/**
 * Builds standard email options (from, reply_to, bcc, and threading headers).
 */
function buildDeliveryEnvelope(
  to: string | string[],
  options?: SendEmailOptions,
  branding?: EmailBranding | null,
  templateContext?: { templateName?: string; payload?: Record<string, any> }
) {
  // 1. Resolve custom domain sender address and sender display name
  const fromAddress = options?.from || process.env.RESEND_SENDER_EMAIL || DEFAULT_SENDER_EMAIL;
  const senderName = options?.senderName || branding?.clinicName || process.env.RESEND_SENDER_NAME || DEFAULT_SENDER_NAME;
  const from = fromAddress.includes('<') ? fromAddress : `${senderName} <${fromAddress}>`;

  // 2. Resolve dynamic business email (from Clinic Settings or Env or Default)
  const businessEmail = branding?.contactEmail || process.env.CLINIC_BUSINESS_EMAIL || DEFAULT_BUSINESS_EMAIL;

  // 3. Dynamic Reply-To Target
  const replyToTarget = options?.replyTo || options?.reply_to || businessEmail;
  const replyTo = Array.isArray(replyToTarget) ? replyToTarget : [replyToTarget];

  // 4. Optional BCC Delivery
  let bcc: string[] | undefined;
  if (options?.bcc) {
    bcc = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
  }

  // 5. Optional Threading Headers (In-Reply-To & References)
  const senderDomain = extractDomain(fromAddress);
  const headers: Record<string, string> = { ...(options?.headers || {}) };

  let inReplyTo = options?.inReplyTo || headers['In-Reply-To'];
  let references = options?.references || headers['References'];

  // If a threadId is explicitly provided, generate threading headers
  if (options?.threadId) {
    const threadMsgId = `<thread-${options.threadId}@${senderDomain}>`;
    if (!inReplyTo) inReplyTo = threadMsgId;
    if (!references) references = threadMsgId;
  }

  // Auto-thread appointment follow-up emails if payload includes appointmentId
  const payload = templateContext?.payload;
  const templateName = templateContext?.templateName;
  if (
    !inReplyTo &&
    !references &&
    payload &&
    typeof payload === 'object' &&
    'appointmentId' in payload &&
    payload.appointmentId
  ) {
    // Initial appointment booking request creates the root thread; subsequent emails reference it
    const isInitialRoot = templateName === 'appointment_request_received';
    const apptMsgId = `<appointment-${payload.appointmentId}@${senderDomain}>`;

    if (!isInitialRoot) {
      inReplyTo = apptMsgId;
      references = apptMsgId;
    }
  }

  if (inReplyTo) {
    headers['In-Reply-To'] = formatMessageId(inReplyTo);
  }

  if (references) {
    const refs = Array.isArray(references) ? references : [references];
    headers['References'] = refs.map(formatMessageId).join(' ');
  }

  return {
    from,
    to: Array.isArray(to) ? to : [to],
    replyTo,
    bcc,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  };
}

export const ResendService = {
  /**
   * Helper to load dynamic clinic branding from settings.
   */
  async loadClinicBranding(): Promise<EmailBranding | null> {
    try {
      const supabase = await createAdminClient();
      const config = await getClinicConfigUseCase(getClinicConfigQuery(supabase))();
      return resolveEmailBranding(config, getBaseUrl());
    } catch (err) {
      console.warn('Failed to load dynamic clinic branding for email, using fallback defaults:', err);
      return resolveEmailBranding(null, getBaseUrl());
    }
  },

  /**
   * Resolves the dynamic clinic business email used as reply-to for all outbound emails.
   * Priority: branding contactEmail → CLINIC_BUSINESS_EMAIL env → DEFAULT_BUSINESS_EMAIL constant.
   */
  resolveBusinessEmail(branding: EmailBranding | null): string {
    return branding?.contactEmail || process.env.CLINIC_BUSINESS_EMAIL || DEFAULT_BUSINESS_EMAIL;
  },

  /**
   * Resolves the dynamic clinic name used as the sender display name for all outbound emails.
   * Priority: branding clinicName → RESEND_SENDER_NAME env → DEFAULT_SENDER_NAME constant.
   */
  resolveClinicName(branding: EmailBranding | null): string {
    return branding?.clinicName || process.env.RESEND_SENDER_NAME || DEFAULT_SENDER_NAME;
  },

  /**
   * Sends a raw / custom HTML email via Resend with dynamic domain, BCC, reply-to, and headers.
   */
  async sendEmail(params: SendGenericEmailParams) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const branding = await this.loadClinicBranding();
    const envelope = buildDeliveryEnvelope(params.to, params, branding);

    const { data, error } = await resend.emails.send({
      from: envelope.from,
      to: envelope.to,
      subject: params.subject,
      ...(params.html ? { html: params.html } : { html: params.text || '' }),
      ...(params.text ? { text: params.text } : {}),
      replyTo: envelope.replyTo,
      ...(envelope.bcc && envelope.bcc.length > 0 ? { bcc: envelope.bcc } : {}),
      ...(params.cc ? { cc: params.cc } : {}),
      ...(envelope.headers ? { headers: envelope.headers } : {}),
    } as any);

    if (error) {
      throw new Error(`Resend API Error: ${error.message}`);
    }

    return data;
  },

  /**
   * Renders the requested template and sends it via Resend with dynamic domain, BCC, reply-to, and headers.
   */
  async sendTemplatedEmail<K extends keyof EmailTemplates>(
    to: string,
    subject: string,
    templateName: K,
    payload: EmailTemplates[K],
    options?: SendEmailOptions
  ) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    let html = '';

    // Resolve clinic branding (name, logo, phone, address, website) from Clinic Settings.
    let branding: EmailBranding | null = null;
    try {
      branding = await this.loadClinicBranding();
    } catch (err) {
      console.warn('Failed to load clinic branding for email, using defaults:', err);
    }

    // Render the appropriate React Email component to an HTML string
    switch (templateName) {
      case 'signup_otp': {
        const otpPayload = payload as EmailTemplates['signup_otp'];
        html = await render(React.createElement(SignupOtpEmail, { 
          firstName: otpPayload.firstName, 
          otpCode: otpPayload.otpCode,
          clinicName: branding?.clinicName,
          branding: branding || undefined,
        }));
        break;
      }
      case 'reset_password_otp': {
        const resetPayload = payload as EmailTemplates['reset_password_otp'];
        html = await render(React.createElement(ResetPasswordOtpEmail, { 
          firstName: resetPayload.firstName, 
          otpCode: resetPayload.otpCode,
          clinicName: branding?.clinicName,
          branding: branding || undefined,
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
      case 'checkout_follow_up': {
        const reqPayload = payload as EmailTemplates['checkout_follow_up'];
        html = await render(React.createElement(CheckoutFollowUpEmail, {
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

    // Resolve dynamic clinic values from branding for this send.
    // For templated emails, reply-to ALWAYS points to the clinic's business email
    // so that patients who hit "Reply" reach the clinic — never the noreply sender.
    // senderName ALWAYS uses the dynamic clinic name from settings.
    const businessEmail = this.resolveBusinessEmail(branding);
    const clinicName = this.resolveClinicName(branding);

    // Build explicit options that enforce clinic reply-to and sender name.
    // Caller-provided options are merged but replyTo and senderName are always
    // sourced from the dynamic clinic settings unless explicitly overridden by the caller.
    const resolvedOptions: SendEmailOptions = {
      ...options,
      // Always use the dynamic clinic business email as reply-to for template emails
      replyTo: options?.replyTo ?? businessEmail,
      // Always use the dynamic clinic name as the sender display name
      senderName: options?.senderName ?? clinicName,
    };

    // Build envelope with custom domain sender, dynamic reply_to, dynamic bcc, and threading headers
    const envelope = buildDeliveryEnvelope(to, resolvedOptions, branding, {
      templateName: templateName as string,
      payload: payload as Record<string, any>,
    });

    const { data, error } = await resend.emails.send({
      from: envelope.from,
      to: envelope.to,
      subject,
      html,
      replyTo: envelope.replyTo,
      ...(envelope.bcc && envelope.bcc.length > 0 ? { bcc: envelope.bcc } : {}),
      ...(resolvedOptions.cc ? { cc: resolvedOptions.cc } : {}),
      ...(envelope.headers ? { headers: envelope.headers } : {}),
    });

    if (error) {
      throw new Error(`Resend API Error: ${error.message}`);
    }

    return data;
  }
};
