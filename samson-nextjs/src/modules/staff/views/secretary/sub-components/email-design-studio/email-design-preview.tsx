import React, { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AppointmentConfirmedEmail from '@/components/emails/appointment-confirmed-email';
import AppointmentReminderEmail from '@/components/emails/appointment-reminder-email';
import AppointmentCancelledEmail from '@/components/emails/appointment-cancelled-email';
import AppointmentRescheduledEmail from '@/components/emails/appointment-rescheduled-email';
import StaffReplyEmail from '@/components/emails/staff-reply-email';
import PostCareEmail from '@/components/emails/post-care-email';
import AppointmentRequestReceivedEmail from '@/components/emails/appointment-request-received-email';
import RequestRejectedEmail from '@/components/emails/request-rejected-email';
import {
  DesignTokens,
  DraftCopy,
  EmailDesignDefinition,
  SampleData,
} from './types';

export interface EmailDesignPreviewProps {
  design: EmailDesignDefinition;
  tokens: DesignTokens;
  copy: DraftCopy;
  sample: SampleData;
}

export function EmailDesignPreview({
  design,
  sample,
}: EmailDesignPreviewProps) {
  const baseUrl = sample.baseUrl || 'http://localhost:3000';
  const patientName = sample.patientName || 'Valued Patient';
  const serviceName = sample.serviceName || 'Dental Consultation & Cleaning';
  const doctorName = sample.doctorName || 'Dr. Adrian Samson';
  const dateStr = sample.dateStr || 'Monday, June 22, 2026';
  const timeRangeStr = sample.timeRangeStr || sample.preferredStartTimeStr || '2:00 PM – 2:45 PM';
  const appointmentId = sample.appointmentId || 'APT-SAMPLE';

  const element = useMemo(() => {
    switch (design.id) {
      case 'appointment-confirmed':
        return (
          <AppointmentConfirmedEmail
            patientName={patientName}
            serviceName={serviceName}
            doctorName={doctorName}
            dateStr={dateStr}
            timeRangeStr={timeRangeStr}
            appointmentId={appointmentId}
            baseUrl={baseUrl}
          />
        );
      case 'reminder-24h':
        return (
          <AppointmentReminderEmail
            reminderTitle="24-hour Reminder"
            patientName={patientName}
            serviceName={serviceName}
            doctorName={doctorName}
            dateStr={dateStr}
            timeRangeStr={timeRangeStr}
            appointmentId={appointmentId}
            baseUrl={baseUrl}
          />
        );
      case 'reminder-48h':
        return (
          <AppointmentReminderEmail
            reminderTitle="48-hour Reminder"
            patientName={patientName}
            serviceName={serviceName}
            doctorName={doctorName}
            dateStr={dateStr}
            timeRangeStr={timeRangeStr}
            appointmentId={appointmentId}
            baseUrl={baseUrl}
          />
        );
      case 'cancelled':
        return (
          <AppointmentCancelledEmail
            patientName={patientName}
            serviceName={serviceName}
            dateStr={dateStr}
            timeRangeStr={timeRangeStr}
            appointmentId={appointmentId}
            cancellationReason={sample.cancellationReason}
            baseUrl={baseUrl}
          />
        );
      case 'rescheduled':
        return (
          <AppointmentRescheduledEmail
            patientName={patientName}
            serviceName={serviceName}
            doctorName={doctorName}
            oldDateStr={sample.oldDateStr}
            oldTimeRangeStr={sample.oldTimeRangeStr}
            dateStr={dateStr}
            timeRangeStr={timeRangeStr}
            appointmentId={appointmentId}
            baseUrl={baseUrl}
          />
        );
      case 'staff-reply':
        return (
          <StaffReplyEmail
            patientName={patientName}
            chatToken={appointmentId}
            baseUrl={baseUrl}
          />
        );
      case 'post-care':
        return (
          <PostCareEmail
            patientName={patientName}
            serviceName={serviceName}
            doctorName={doctorName}
            dateStr={dateStr}
            appointmentId={appointmentId}
            baseUrl={baseUrl}
          />
        );
      case 'booking-request-received':
        return (
          <AppointmentRequestReceivedEmail
            accountHolderName={patientName}
            patientName={patientName}
            serviceName={serviceName}
            doctorName={doctorName}
            dateStr={dateStr}
            timeRangeStr={sample.preferredStartTimeStr || timeRangeStr}
            appointmentId={appointmentId}
            baseUrl={baseUrl}
          />
        );
      case 'request-rejected':
        return (
          <RequestRejectedEmail
            patientName={patientName}
            serviceName={serviceName}
            dateStr={dateStr}
            preferredStartTimeStr={sample.preferredStartTimeStr || timeRangeStr}
            rejectionReason={sample.rejectionReason}
            baseUrl={baseUrl}
          />
        );
      default:
        return null;
    }
  }, [design.id, patientName, serviceName, doctorName, dateStr, timeRangeStr, appointmentId, baseUrl, sample.cancellationReason, sample.oldDateStr, sample.oldTimeRangeStr, sample.preferredStartTimeStr, sample.rejectionReason]);

  const htmlString = useMemo(() => {
    if (!element) return '';
    return renderToStaticMarkup(element);
  }, [element]);

  return (
    <iframe
      srcDoc={htmlString}
      title="Email Preview"
      className="w-full border-0 bg-white shadow-xs rounded-lg min-h-[680px]"
      style={{ width: '100%', height: '680px', border: 'none' }}
    />
  );
}
