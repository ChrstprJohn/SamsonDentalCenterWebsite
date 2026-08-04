'use client';

import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  Mail,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type EmailDesignId =
  | 'appointment-confirmed'
  | 'reminder-24h'
  | 'reminder-48h'
  | 'cancelled'
  | 'rescheduled'
  | 'staff-reply'
  | 'post-care'
  | 'booking-request-received'
  | 'request-rejected';

type PreviewMode = 'desktop' | 'mobile';

type SampleDataField =
  | 'patientName'
  | 'serviceName'
  | 'doctorName'
  | 'dateStr'
  | 'timeRangeStr'
  | 'appointmentId'
  | 'baseUrl'
  | 'rejectionReason'
  | 'cancellationReason';

interface SampleData {
  patientName: string;
  serviceName: string;
  doctorName: string;
  dateStr: string;
  timeRangeStr: string;
  appointmentId: string;
  baseUrl: string;
  rejectionReason: string;
  cancellationReason: string;
}

interface DesignTokens {
  primary: string;
  accent: string;
  canvas: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  buttonText: string;
  radius: number;
  density: number;
  fontFamily: string;
}

interface DraftCopy {
  subject: string;
  preheader: string;
  headerLabel: string;
  headline: string;
  intro: string;
  ctaLabel: string;
  primaryInstruction: string;
  secondaryInstruction: string;
  footerText: string;
  showSummary: boolean;
  showCta: boolean;
  showInstructions: boolean;
  showFooter: boolean;
}

interface EmailDesignDefinition {
  id: EmailDesignId;
  label: string;
  category: string;
  description: string;
  event: string;
  fields: SampleDataField[];
}

const EMAIL_DESIGNS: EmailDesignDefinition[] = [
  {
    id: 'appointment-confirmed',
    label: 'Appointment Confirmed',
    category: 'Appointments',
    description: 'Sent when an inquiry is converted or manually booked.',
    event: 'APPOINTMENT_CONVERTED / MANUAL_BOOKING',
    fields: ['patientName', 'serviceName', 'doctorName', 'dateStr', 'timeRangeStr', 'appointmentId', 'baseUrl'],
  },
  {
    id: 'reminder-24h',
    label: '24-hour Reminder',
    category: 'Reminders',
    description: 'Sent 1 day before the scheduled appointment.',
    event: 'APPOINTMENT_REMINDER_24H',
    fields: ['patientName', 'serviceName', 'doctorName', 'dateStr', 'timeRangeStr', 'appointmentId', 'baseUrl'],
  },
  {
    id: 'reminder-48h',
    label: '48-hour Reminder',
    category: 'Reminders',
    description: 'Sent 2 days before the scheduled appointment.',
    event: 'APPOINTMENT_REMINDER_48H',
    fields: ['patientName', 'serviceName', 'doctorName', 'dateStr', 'timeRangeStr', 'appointmentId', 'baseUrl'],
  },
  {
    id: 'cancelled',
    label: 'Appointment Cancelled',
    category: 'Appointments',
    description: 'Confirmation when an appointment is cancelled.',
    event: 'CANCEL_BOOKING',
    fields: ['patientName', 'dateStr', 'cancellationReason'],
  },
  {
    id: 'rescheduled',
    label: 'Appointment Rescheduled',
    category: 'Appointments',
    description: 'Sent when appointment date/time is modified.',
    event: 'RESCHEDULE_BOOKING',
    fields: ['patientName', 'dateStr', 'timeRangeStr', 'baseUrl'],
  },
  {
    id: 'staff-reply',
    label: 'Staff Chat Reply',
    category: 'Conversation',
    description: 'Notification when clinic staff replies in chat.',
    event: 'STAFF_REPLIED_TO_CHAT',
    fields: ['patientName', 'baseUrl'],
  },
  {
    id: 'post-care',
    label: 'Post-care / Review',
    category: 'Follow-up',
    description: 'Sent after appointment completion for feedback.',
    event: 'APPOINTMENT_COMPLETED_POST_CARE',
    fields: ['patientName', 'serviceName', 'doctorName', 'dateStr', 'appointmentId', 'baseUrl'],
  },
  {
    id: 'booking-request-received',
    label: 'Booking Request Received',
    category: 'Inquiries',
    description: 'Sent to guest when their booking inquiry is received. (Not yet implemented)',
    event: 'INQUIRY_RECEIVED — pending implementation',
    fields: ['patientName'],
  },
  {
    id: 'request-rejected',
    label: 'Request Rejected',
    category: 'Inquiries',
    description: 'Sent when a guest inquiry is declined. (Not yet implemented)',
    event: 'REJECT_INQUIRY — pending implementation',
    fields: ['patientName', 'rejectionReason'],
  },
];

const DEFAULT_TOKENS: DesignTokens = {
  primary: '#2563eb',
  accent: '#0f766e',
  canvas: '#eef2f7',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  buttonText: '#ffffff',
  radius: 16,
  density: 24,
  fontFamily: 'Arial, Helvetica, sans-serif',
};

const DEFAULT_SAMPLE_DATA: SampleData = {
  patientName: 'Alice Guest',
  serviceName: 'Dental Consultation & Cleaning',
  doctorName: 'Dr. Adrian Samson',
  dateStr: 'Monday, June 22, 2026',
  timeRangeStr: '2:00 PM – 2:45 PM',
  appointmentId: 'APT-GUEST-2026-0622',
  baseUrl: 'http://localhost:3000',
  rejectionReason: 'Unfortunately, we are unable to accommodate your request at this time.',
  cancellationReason: 'This appointment has been cancelled as requested.',
};

const PRESET_SCENARIOS = [
  {
    label: 'Standard Guest',
    data: {
      patientName: 'Alice Guest',
      serviceName: 'Dental Consultation & Cleaning',
      doctorName: 'Dr. Adrian Samson',
      dateStr: 'Monday, June 22, 2026',
      timeRangeStr: '2:00 PM – 2:45 PM',
      appointmentId: 'APT-GUEST-2026-0622',
      baseUrl: 'http://localhost:3000',
      rejectionReason: 'Unfortunately, we are unable to accommodate your request at this time.',
      cancellationReason: 'This appointment has been cancelled as requested.',
    },
  },
  {
    label: 'Long Name Stress-Test',
    data: {
      patientName: 'Alexandria Marie Villanueva-Santos',
      serviceName: 'Comprehensive Orthodontic Consultation & Digital X-Ray',
      doctorName: 'Dr. Gabriella Montemayor-Samson',
      dateStr: 'Wednesday, September 30, 2026',
      timeRangeStr: '4:30 PM – 5:45 PM',
      appointmentId: 'APT-GUEST-2026-0930-LONG-REF-9921',
      baseUrl: 'https://samson-dental.com',
      rejectionReason: 'Unfortunately, we are unable to accommodate your request at this time.',
      cancellationReason: 'This appointment has been cancelled as requested.',
    },
  },
];

const DEFAULT_COPY: Record<EmailDesignId, DraftCopy> = {
  'appointment-confirmed': {
    subject: 'Your Appointment is Confirmed - Samson Dental Center',
    preheader: 'Your dental appointment has been successfully booked. View your visit details inside.',
    headerLabel: 'Appointment Confirmed',
    headline: 'Your Appointment is Confirmed',
    intro: "We are delighted to confirm your upcoming dental appointment at Samson Dental Center. Below are your visit details. Please review this information to ensure its accuracy.",
    ctaLabel: 'Open Clinic Chat',
    primaryInstruction: 'Please arrive 10 to 15 minutes before your scheduled time to complete check-in.',
    secondaryInstruction: '',
    footerText: 'Samson Dental Center • Caring for Your Smile',
    showSummary: true,
    showCta: true,
    showInstructions: true,
    showFooter: true,
  },
  'reminder-24h': {
    subject: 'Reminder: Your Appointment is Tomorrow - Samson Dental Center',
    preheader: 'Your dental appointment is scheduled for tomorrow. View your details inside.',
    headerLabel: 'Appointment Reminder',
    headline: 'Your Appointment is Tomorrow',
    intro: "We're reaching out to remind you about your upcoming dental appointment with us at Samson Dental Center. Here are your visit details for tomorrow:",
    ctaLabel: 'Open Clinic Chat',
    primaryInstruction: 'Please arrive at least 10 minutes before your scheduled time.',
    secondaryInstruction: '',
    footerText: 'Samson Dental Center • Caring for Your Smile',
    showSummary: true,
    showCta: true,
    showInstructions: true,
    showFooter: true,
  },
  'reminder-48h': {
    subject: 'Reminder: Your Appointment is in 2 Days - Samson Dental Center',
    preheader: 'Your dental appointment is coming up in 2 days. Review your visit details.',
    headerLabel: 'Appointment Reminder',
    headline: 'Your Appointment is in 2 Days',
    intro: "This is a friendly reminder about your upcoming dental appointment with us at Samson Dental Center. Here are your visit details:",
    ctaLabel: 'Open Clinic Chat',
    primaryInstruction: 'Please arrive at least 10 minutes before your scheduled time.',
    secondaryInstruction: '',
    footerText: 'Samson Dental Center • Caring for Your Smile',
    showSummary: true,
    showCta: true,
    showInstructions: true,
    showFooter: true,
  },
  cancelled: {
    subject: 'Your Appointment Has Been Cancelled - Samson Dental Center',
    preheader: 'Your appointment cancellation has been processed. We hope to see you again soon.',
    headerLabel: 'Appointment Cancelled',
    headline: 'Your Appointment Has Been Cancelled',
    intro: 'We are writing to confirm that your appointment at Samson Dental Center has been cancelled as requested. We are sorry we will not be able to see you this time, and we hope to welcome you back soon.',
    ctaLabel: '',
    primaryInstruction: '',
    secondaryInstruction: '',
    footerText: 'Samson Dental Center • Caring for Your Smile',
    showSummary: false,
    showCta: false,
    showInstructions: false,
    showFooter: true,
  },
  rescheduled: {
    subject: 'Your Appointment Has Been Rescheduled - Samson Dental Center',
    preheader: 'Your appointment has been moved to a new date and time. Review your updated schedule.',
    headerLabel: 'Appointment Rescheduled',
    headline: 'Your Appointment Has Been Rescheduled',
    intro: "We're writing to confirm that your appointment at Samson Dental Center has been successfully rescheduled. Here are your updated visit details:",
    ctaLabel: 'Open Clinic Chat',
    primaryInstruction: 'Please arrive 10 to 15 minutes before your scheduled time to complete check-in.',
    secondaryInstruction: '',
    footerText: 'Samson Dental Center • Caring for Your Smile',
    showSummary: true,
    showCta: true,
    showInstructions: true,
    showFooter: true,
  },
  'staff-reply': {
    subject: 'You Have a New Message from Samson Dental Center',
    preheader: 'A member of our clinic team has sent you a message. Click to view and reply.',
    headerLabel: 'New Message',
    headline: 'A Message from Our Clinic Team',
    intro: 'A member of our clinic staff has sent you a reply regarding your appointment or inquiry. We are standing by to help.',
    ctaLabel: 'Open Clinic Chat',
    primaryInstruction: '',
    secondaryInstruction: '',
    footerText: 'Samson Dental Center • Caring for Your Smile',
    showSummary: false,
    showCta: true,
    showInstructions: false,
    showFooter: true,
  },
  'post-care': {
    subject: 'Thank You for Your Visit - Samson Dental Center',
    preheader: 'We hope your visit went well. Your feedback means a lot to us.',
    headerLabel: 'Visit Complete',
    headline: 'Thank You for Your Visit',
    intro: 'Thank you for visiting Samson Dental Center. We hope your appointment went smoothly and that you are feeling great. Your experience is important to us, and we would love to hear how things went.',
    ctaLabel: 'Share Your Feedback',
    primaryInstruction: 'Please follow all post-treatment care instructions provided by your doctor.',
    secondaryInstruction: 'If you have any concerns or questions following your visit, please do not hesitate to reach out to our clinic anytime.',
    footerText: 'Samson Dental Center • Caring for Your Smile',
    showSummary: true,
    showCta: true,
    showInstructions: true,
    showFooter: true,
  },
  'booking-request-received': {
    subject: 'We\'ve Received Your Booking Request - Samson Dental Center',
    preheader: 'Thank you for reaching out. We will review your request and be in touch shortly.',
    headerLabel: 'Booking Request Received',
    headline: 'We\'ve Received Your Booking Request',
    intro: 'Thank you for reaching out to Samson Dental Center. We have successfully received your booking request and our team is currently reviewing it. We will get back to you as soon as possible to confirm your appointment details.',
    ctaLabel: '',
    primaryInstruction: '',
    secondaryInstruction: '',
    footerText: 'Samson Dental Center • Caring for Your Smile',
    showSummary: false,
    showCta: false,
    showInstructions: false,
    showFooter: true,
  },
  'request-rejected': {
    subject: 'Update on Your Booking Request - Samson Dental Center',
    preheader: 'An update regarding your recent booking request at Samson Dental Center.',
    headerLabel: 'Request Update',
    headline: 'Update on Your Booking Request',
    intro: 'Thank you for your interest in Samson Dental Center. After carefully reviewing your booking request, we regret to inform you that we are unable to accommodate your request at this time.',
    ctaLabel: '',
    primaryInstruction: '',
    secondaryInstruction: '',
    footerText: 'Samson Dental Center • Caring for Your Smile',
    showSummary: false,
    showCta: false,
    showInstructions: false,
    showFooter: true,
  },
};



const p: React.CSSProperties = { margin: '0 0 16px', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 };
const bold: React.CSSProperties = { fontWeight: 700 };
const link: React.CSSProperties = { color: '#2563eb', textDecoration: 'underline', fontWeight: 600 };
const muted: React.CSSProperties = { color: '#64748b', fontSize: 12, lineHeight: 1.6 };

function EmailDesignPreview({
  design,
  tokens,
  copy,
  sample,
}: {
  design: EmailDesignDefinition;
  tokens: DesignTokens;
  copy: DraftCopy;
  sample: SampleData;
}) {
  const isCancelled = design.id === 'cancelled';
  const isConfirmed = design.id === 'appointment-confirmed';
  const isReminder = design.id === 'reminder-24h' || design.id === 'reminder-48h';
  const isRescheduled = design.id === 'rescheduled';
  const isPostCare = design.id === 'post-care';
  const isStaffReply = design.id === 'staff-reply';
  const isBookingRequestReceived = design.id === 'booking-request-received';
  const isRequestRejected = design.id === 'request-rejected';
  const baseUrl = sample.baseUrl || 'http://localhost:3000';
  const chatUrl = `${baseUrl}/manage?token=${sample.appointmentId || 'APT-SAMPLE'}&openChat=true`;
  const feedbackUrl = `${baseUrl}/feedback?ref=${sample.appointmentId || 'APT-SAMPLE'}`;
  const ctaHref = isPostCare ? feedbackUrl : chatUrl;

  const statusLabel = isConfirmed || isReminder || isRescheduled ? 'Confirmed / Approved' : isPostCare ? 'Completed' : isBookingRequestReceived ? 'Pending Review' : null;

  const showDetails = copy.showSummary && !isCancelled && !isStaffReply && !isRequestRejected;

  return (
    <div style={{ background: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', minHeight: '100%' }}>
      <style>{`
        .eml-body { padding: 36px 40px 48px; }
        .eml-logo { width: 130px; }
        .eml-p { font-size: 14px; line-height: 1.75; }
        @media only screen and (max-width: 480px) {
          .eml-body { padding: 24px 20px 36px !important; }
          .eml-logo { width: 100px !important; }
          .eml-p { font-size: 15px !important; line-height: 1.8 !important; }
        }
      `}</style>
      <div className="eml-body" style={{ maxWidth: 600, margin: '0 auto', background: '#ffffff' }}>

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <img
            src="/images/SamsonLOGOGO-removebg-preview.png"
            alt="Samson Dental Center"
            className="eml-logo"
            style={{ height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
        </div>

        {/* Greeting */}
        <p style={p}>Dear <span style={{ fontWeight: 700 }}>{sample.patientName || 'Valued Patient'}</span>,</p>

        {/* Opening paragraph */}
        <p style={p}>{copy.intro}</p>

        {/* Appointment details block — label: value format */}
        {showDetails && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            {isRescheduled && (
              <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your new appointment details:</p>
            )}
            {statusLabel && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Status:</span>{' '}
                <span style={{ fontWeight: 700, color: isPostCare ? '#0f766e' : '#2563eb' }}>{statusLabel}</span>
                {isBookingRequestReceived && (
                  <span style={{ fontWeight: 400, fontSize: 12, color: '#94a3b8', marginLeft: 6 }}>(preview only — actual status is NEW or CONVERTED)</span>
                )}
              </p>
            )}
            {sample.doctorName && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Doctor:</span> {sample.doctorName}</p>
            )}
            {sample.serviceName && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Service:</span> {sample.serviceName}</p>
            )}
            <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Location:</span> Samson Dental Center, Quezon City, Metro Manila</p>
            {sample.dateStr && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Date:</span> {sample.dateStr}</p>
            )}
            {sample.timeRangeStr && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Time:</span> {sample.timeRangeStr}</p>
            )}
            {sample.appointmentId && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Reference ID:</span> {sample.appointmentId}</p>
            )}
          </div>
        )}

        {/* Cancelled — date line + optional reason */}
        {isCancelled && sample.dateStr && (
          <p style={p}>
            Your appointment originally scheduled for <span style={bold}>{sample.dateStr}</span> has been cancelled.{' '}
            <span style={{ fontWeight: 700 }}>
              {sample.cancellationReason || 'This appointment has been cancelled as requested.'}
            </span>
          </p>
        )}

        {/* Staff reply — primary CTA paragraph */}
        {isStaffReply && copy.showCta && (
          <p style={p}>
            Please{' '}
            <a href={ctaHref} style={link}>click here to open your clinic chat</a>{' '}
            to view the message and continue the conversation.
          </p>
        )}

        {/* Instructions */}
        {copy.showInstructions && (copy.primaryInstruction || copy.secondaryInstruction) && (
          <>
            {copy.primaryInstruction && <p style={p}>{copy.primaryInstruction}</p>}
            {copy.secondaryInstruction && <p style={p}>{copy.secondaryInstruction}</p>}
          </>
        )}

        {/* Post-care feedback CTA */}
        {isPostCare && copy.showCta && copy.ctaLabel && (
          <p style={p}>
            If you have a moment, we would love to hear about your experience &mdash; please{' '}
            <a href={ctaHref} style={link}>click here to share your feedback</a>. Your feedback helps us continue to improve.
          </p>
        )}

        {/* Appreciation / care paragraph */}
        {!isCancelled && !isStaffReply && !isRequestRejected && (
          <p style={p}>
            {isPostCare
              ? 'Your health and well-being are our top priority, and we greatly appreciate your trust in our care. If you have any specific concerns following your visit, please feel free to let us know.'
              : isBookingRequestReceived
              ? 'We appreciate your patience while we review your request. Our team will reach out to you shortly to confirm the details of your appointment.'
              : 'Your health is our top priority, and we greatly appreciate your trust in our care. If you have any specific concerns or requests for your appointment, please feel free to let us know.'
            }
          </p>
        )}

        {/* Request rejected — apology paragraph + reason */}
        {isRequestRejected && (
          <p style={p}>
            We sincerely apologize for any inconvenience this may cause.{' '}
            <span style={{ fontWeight: 700 }}>
              {sample.rejectionReason || 'Unfortunately, we are unable to accommodate your request at this time.'}
            </span>{' '}
            If you would like to explore alternative dates or have any questions about our available services, please do not hesitate to contact us.
          </p>
        )}

        {/* Single consolidated contact block — chat link + phone if chat available, phone-only if not */}
        <p style={p}>
          {copy.showCta && !isPostCare
            ? <>
                If you have any questions{!isStaffReply && !isPostCare ? ', need to reschedule,' : ''} or need further assistance, please don&apos;t hesitate to reach out. You can{' '}
                <a href={ctaHref} style={link}>click here to open the clinic chat</a>{' '}
                or call or text us at <a href="tel:028123456" style={link}>(02) 8123-4567</a>.{' '}
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Please note that replies to this email are not monitored.</span>
              </>
            : <>If you have any questions or would like to reschedule a future appointment, please don&apos;t hesitate to call or text us at{' '}<a href="tel:028123456" style={link}>(02) 8123-4567</a>.{' '}<span style={{ color: '#dc2626', fontWeight: 600 }}>Please note that replies to this email are not monitored.</span></>
          }
        </p>

        {/* Closing */}
        <p style={{ ...p, marginBottom: 24 }}>
          {isCancelled
            ? "Thank you for letting us know, and we hope to welcome you back at Samson Dental Center soon."
            : isRequestRejected
            ? "We hope to have the opportunity to serve you in the future. Thank you for considering Samson Dental Center."
            : isBookingRequestReceived
            ? "Thank you for choosing Samson Dental Center. We look forward to welcoming you soon."
            : isPostCare
            ? "Thank you for choosing Samson Dental Center. We're dedicated to providing you with the best possible dental care experience."
            : `Thank you for choosing Samson Dental Center. We can't wait to see you on ${sample.dateStr || 'your appointment date'} at ${sample.timeRangeStr || 'the scheduled time'}.`
          }
        </p>

        {/* Signature */}
        <p style={{ ...p, marginBottom: 4 }}>Warm regards,</p>
        <p style={{ ...p, marginBottom: 2, ...bold }}>Samson Dental Center</p>
        <p style={{ ...p, color: '#64748b', marginBottom: 0 }}>
          (02) 8123-4567 &nbsp;·&nbsp;{' '}
          <a href={baseUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>samsondentalcenter.com.ph</a>
        </p>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0 20px' }} />

        {/* Legal footer */}
        {copy.showFooter && (
          <p style={{ ...muted, margin: 0 }}>
            {isBookingRequestReceived || isRequestRejected
              ? 'You received this email because you submitted a booking inquiry with Samson Dental Center.'
              : 'You received this email because you have an appointment with Samson Dental Center.'}
            {' '}If you believe this was sent in error, please contact our office.{' '}
            <a href={`${baseUrl}/terms`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>Terms of Service</a>
            {' '}·{' '}
            <a href={`${baseUrl}/privacy`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>Privacy Policy</a>
          </p>
        )}
      </div>
    </div>
  );
}

export function SecretaryEmailDesignStudioView() {
  const [activeId, setActiveId] = useState<EmailDesignId>('appointment-confirmed');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [sample, setSample] = useState<SampleData>(DEFAULT_SAMPLE_DATA);

  const activeDesign = EMAIL_DESIGNS.find((design) => design.id === activeId) || EMAIL_DESIGNS[0];
  const activeCopy = DEFAULT_COPY[activeId];
  const visibleFields = useMemo(() => new Set(activeDesign.fields), [activeDesign]);

  const groupedDesigns = useMemo(() => EMAIL_DESIGNS.reduce<Record<string, EmailDesignDefinition[]>>((groups, design) => {
    groups[design.category] = [...(groups[design.category] || []), design];
    return groups;
  }, {}), []);

  const updateSampleField = <K extends keyof SampleData>(key: K, value: SampleData[K]) => {
    setSample((current) => ({ ...current, [key]: value }));
  };

  const applyPreset = (presetData: SampleData) => {
    setSample(presetData);
  };

  const clearAllFields = () => {
    setSample({
      patientName: '',
      serviceName: '',
      doctorName: '',
      dateStr: '',
      timeRangeStr: '',
      appointmentId: '',
      baseUrl: 'http://localhost:3000',
      rejectionReason: '',
      cancellationReason: '',
    });
  };

  return (
    <div className="grid h-full min-h-0 flex-1 grid-cols-1 overflow-hidden bg-background xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      {/* Left Sidebar: Email Template Selector */}
      <aside
        data-lenis-prevent
        style={{ scrollbarWidth: 'thin' }}
        className="hidden min-h-0 !overflow-y-auto border-r border-card-border/70 bg-card xl:block [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <div className="flex h-[61px] items-center border-b border-card-border/70 p-4 shrink-0">
          <div>
            <div className="text-base font-medium text-foreground">Email Templates</div>
            <p className="text-[11px] text-muted-foreground">Select an email notification to preview</p>
          </div>
        </div>
        <div className="space-y-4 p-3">
          {Object.entries(groupedDesigns).map(([category, designs]) => (
            <div key={category}>
              <div className="px-1 pb-2 text-[11px] font-semibold text-muted-foreground">{category}</div>
              <div className="space-y-2">
                {designs.map((design) => {
                  const active = design.id === activeId;
                  return (
                    <button
                      key={design.id}
                      type="button"
                      onClick={() => setActiveId(design.id)}
                      className={`group flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-primary/40 bg-primary/5 text-foreground font-semibold shadow-2xs'
                          : 'border-card-border/50 bg-card text-foreground hover:border-card-border hover:bg-secondary-bg/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`grid size-8 shrink-0 place-items-center rounded-lg ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <Mail className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold">{design.label}</span>
                          <span className="block truncate text-[11px] text-muted-foreground mt-0.5">{design.description}</span>
                        </div>
                      </div>
                      <ChevronRight className={`size-4 shrink-0 transition-transform ${active ? 'translate-x-0.5 text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Center Main: Live Email Preview */}
      <main
        data-lenis-prevent
        style={{ scrollbarWidth: 'thin' }}
        className="flex h-full min-h-0 flex-col !overflow-y-auto bg-card [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <div className="flex h-[61px] items-center justify-between gap-3 bg-card p-4 shrink-0">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{activeCopy.subject}</div>
            <span className="text-[11px] text-muted-foreground truncate block mt-0.5">{activeDesign.label}</span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-card-border bg-secondary-bg/50 p-1 shadow-sm">
            <Button variant={previewMode === 'desktop' ? 'secondary' : 'ghost'} size="sm" onClick={() => setPreviewMode('desktop')} className="h-7 text-xs"><Monitor className="mr-1.5 size-3.5" /> Desktop</Button>
            <Button variant={previewMode === 'mobile' ? 'secondary' : 'ghost'} size="sm" onClick={() => setPreviewMode('mobile')} className="h-7 text-xs"><Smartphone className="mr-1.5 size-3.5" /> Mobile</Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <div className="p-3 xl:hidden">
            <Select
              label="Email template"
              value={activeId}
              onChange={(event) => setActiveId(event.target.value as EmailDesignId)}
              options={EMAIL_DESIGNS.map((email) => ({ value: email.id, label: email.label }))}
            />
          </div>

          <div className="mx-auto transition-all duration-300 h-full" style={{ width: previewMode === 'mobile' ? 375 : '100%', minWidth: previewMode === 'mobile' ? 375 : undefined }}>
            <EmailDesignPreview design={activeDesign} tokens={DEFAULT_TOKENS} copy={activeCopy} sample={sample} />
          </div>
        </div>
      </main>

      {/* Right Sidebar: Dynamic Data Controls */}
      <aside
        data-lenis-prevent
        style={{ scrollbarWidth: 'thin' }}
        className="hidden min-h-0 !overflow-y-auto border-t border-card-border/70 bg-card xl:block xl:border-l xl:border-t-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <div className="flex h-[61px] items-center border-b border-card-border/70 p-4 shrink-0">
          <div>
            <div className="text-base font-medium text-foreground">Dynamic Data Controls</div>
            <p className="text-[11px] text-muted-foreground">Edit sample data fields live</p>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick Presets</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SCENARIOS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset.data)}
                  className="rounded-lg border border-border bg-secondary-bg/50 px-2.5 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFields}
                className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-600 transition hover:bg-red-100"
              >
                Clear All
              </button>
            </div>
          </div>

          <hr className="border-border/60" />

          <div className="space-y-3">
            {visibleFields.has('patientName') && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Guest / Patient Name</label>
                <Input
                  value={sample.patientName}
                  onChange={(event) => updateSampleField('patientName', event.target.value)}
                  placeholder="e.g. Alice Guest"
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            )}

            {visibleFields.has('serviceName') && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Treatment Service</label>
                <Input
                  value={sample.serviceName}
                  onChange={(event) => updateSampleField('serviceName', event.target.value)}
                  placeholder="e.g. Dental Cleaning"
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            )}

            {visibleFields.has('doctorName') && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Assigned Doctor</label>
                <Input
                  value={sample.doctorName}
                  onChange={(event) => updateSampleField('doctorName', event.target.value)}
                  placeholder="e.g. Dr. Adrian Samson"
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            )}

            {visibleFields.has('dateStr') && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Appointment Date</label>
                <Input
                  value={sample.dateStr}
                  onChange={(event) => updateSampleField('dateStr', event.target.value)}
                  placeholder="e.g. Monday, June 22, 2026"
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            )}

            {visibleFields.has('timeRangeStr') && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Time Range</label>
                <Input
                  value={sample.timeRangeStr}
                  onChange={(event) => updateSampleField('timeRangeStr', event.target.value)}
                  placeholder="e.g. 2:00 PM – 2:45 PM"
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            )}

            {visibleFields.has('appointmentId') && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Reference ID</label>
                <Input
                  value={sample.appointmentId}
                  onChange={(event) => updateSampleField('appointmentId', event.target.value)}
                  placeholder="e.g. APT-GUEST-2026"
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            )}

            {visibleFields.has('baseUrl') && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Base URL (Chat Redirect Link)</label>
                <Input
                  value={sample.baseUrl}
                  onChange={(event) => updateSampleField('baseUrl', event.target.value)}
                  placeholder="e.g. http://localhost:3000"
                  className="h-9 text-xs rounded-lg"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block font-mono">
                  Action Link Target: {sample.baseUrl || 'http://localhost:3000'}/manage?token=...
                </span>
              </div>
            )}
            {visibleFields.has('rejectionReason') && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Rejection Reason</label>
                <textarea
                  value={sample.rejectionReason}
                  onChange={(event) => updateSampleField('rejectionReason', event.target.value)}
                  placeholder="e.g. The requested time slot is no longer available..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
            )}

            {visibleFields.has('cancellationReason') && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Cancellation Reason</label>
                <textarea
                  value={sample.cancellationReason}
                  onChange={(event) => updateSampleField('cancellationReason', event.target.value)}
                  placeholder="e.g. This appointment has been cancelled as requested..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SecretaryEmailDesignStudioView;
