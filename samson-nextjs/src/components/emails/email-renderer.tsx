'use client';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AppointmentConfirmedEmail from './appointment-confirmed-email';
import AppointmentReminderEmail from './appointment-reminder-email';
import AppointmentCancelledEmail from './appointment-cancelled-email';
import AppointmentRescheduledEmail from './appointment-rescheduled-email';
import StaffReplyEmail from './staff-reply-email';
import PostCareEmail from './post-care-email';
import AppointmentRequestReceivedEmail from './appointment-request-received-email';
import RequestRejectedEmail from './request-rejected-email';
import SignupOtpEmail from './signup-otp-email';
import ResetPasswordOtpEmail from './reset-password-otp-email';

import { formatShortDate, formatClinicTime, calculateEndTime } from '@/shared/utils/date.util';

interface RenderedEmailFrameProps {
  eventType: string;
  payload: Record<string, any>;
}

export function RenderedEmailFrame({ eventType, payload }: RenderedEmailFrameProps) {
  const safePayload = payload || {};
  const fullName = [safePayload.firstName, safePayload.lastName].filter(Boolean).join(' ');
  const patientName = safePayload.patientName || safePayload.accountHolderName || fullName || 'Valued Patient';
  const serviceName = safePayload.serviceName || 'Dental Treatment';
  const doctorName = safePayload.doctorName || 'Dr. Assigned Dentist';

  const rawDate = safePayload.dateStr || safePayload.date || safePayload.appointmentDate || safePayload.preferredDate;
  const formattedDate = rawDate ? formatShortDate(rawDate) : '';
  const dateStr = formattedDate && !formattedDate.includes('NaN') ? formattedDate : 'Jun 4, 2026';

  const rawTime = safePayload.timeRangeStr || safePayload.startTime || safePayload.preferredStartTime;
  let timeRangeStr = '09:00 AM - 09:30 AM';

  if (rawTime && !rawTime.includes('NaN')) {
    if (rawTime.includes('-') || rawTime.includes('–')) {
      timeRangeStr = rawTime;
    } else {
      const start = rawTime;
      const duration = safePayload.durationMinutes || safePayload.duration_minutes || 30;
      const end = safePayload.endTime || calculateEndTime(start, duration);
      const startFormatted = formatClinicTime(start);
      const endFormatted = formatClinicTime(end);
      if (startFormatted && endFormatted) {
        timeRangeStr = `${startFormatted} - ${endFormatted}`;
      } else if (startFormatted) {
        timeRangeStr = startFormatted;
      } else {
        timeRangeStr = rawTime;
      }
    }
  }
  const appointmentId = safePayload.appointmentId || safePayload.inquiryId || 'APT-SAMPLE';
  const otpCode = safePayload.otpCode || '123456';
  const chatToken = safePayload.chatToken || '';
  const baseUrl = safePayload.baseUrl || 'http://localhost:3000';
  const cancellationReason = safePayload.cancellationReason || safePayload.reason;
  const rejectionReason = safePayload.rejectionReason || safePayload.reason;

  let element: React.ReactElement;

  if (eventType === 'PATIENT_REGISTERED') {
    element = <SignupOtpEmail firstName={patientName} otpCode={otpCode} />;
  } else if (eventType === 'PASSWORD_RESET_REQUESTED') {
    element = <ResetPasswordOtpEmail firstName={patientName} otpCode={otpCode} />;
  } else if (eventType === 'APPOINTMENT_INQUIRY_RECEIVED' || eventType === 'INQUIRY_RECEIVED' || eventType.includes('REQUEST_RECEIVED')) {
    if (eventType === 'REJECT_INQUIRY') {
      element = (
        <RequestRejectedEmail
          patientName={patientName}
          serviceName={serviceName}
          dateStr={dateStr}
          preferredStartTimeStr={rawTime}
          rejectionReason={rejectionReason}
          baseUrl={baseUrl}
        />
      );
    } else {
      element = (
        <AppointmentRequestReceivedEmail
          accountHolderName={safePayload.accountHolderName || patientName}
          patientName={patientName}
          serviceName={serviceName}
          doctorName={doctorName}
          dateStr={dateStr}
          timeRangeStr={timeRangeStr}
          appointmentId={appointmentId}
          baseUrl={baseUrl}
        />
      );
    }
  } else if (eventType === 'CANCEL_BOOKING' || eventType === 'CANCEL_BOOKING_SMS') {
    element = (
      <AppointmentCancelledEmail
        patientName={patientName}
        serviceName={serviceName}
        dateStr={dateStr}
        timeRangeStr={timeRangeStr}
        appointmentId={appointmentId}
        cancellationReason={cancellationReason}
        baseUrl={baseUrl}
      />
    );
  } else if (eventType === 'RESCHEDULE_BOOKING' || eventType === 'RESCHEDULE_BOOKING_SMS') {
    element = (
      <AppointmentRescheduledEmail
        patientName={patientName}
        serviceName={serviceName}
        doctorName={doctorName}
        dateStr={dateStr}
        timeRangeStr={timeRangeStr}
        appointmentId={appointmentId}
        chatToken={chatToken}
        baseUrl={baseUrl}
      />
    );
  } else if (eventType === 'STAFF_REPLIED_TO_CHAT') {
    element = (
      <StaffReplyEmail
        patientName={patientName}
        chatToken={chatToken}
        baseUrl={baseUrl}
      />
    );
  } else if (eventType === 'APPOINTMENT_COMPLETED_POST_CARE' || eventType === 'APPOINTMENT_COMPLETED_POST_CARE_SMS') {
    element = (
      <PostCareEmail
        patientName={patientName}
        serviceName={serviceName}
        doctorName={doctorName}
        dateStr={dateStr}
        appointmentId={appointmentId}
        baseUrl={baseUrl}
      />
    );
  } else if (eventType === 'REJECT_INQUIRY') {
    element = (
      <RequestRejectedEmail
        patientName={patientName}
        rejectionReason={rejectionReason}
        baseUrl={baseUrl}
      />
    );
  } else if (eventType.startsWith('APPOINTMENT_REMINDER')) {
    const reminderTitle = eventType.includes('24H') ? '24-hour Reminder' : '48-hour Reminder';
    element = (
      <AppointmentReminderEmail
        reminderTitle={reminderTitle}
        patientName={patientName}
        serviceName={serviceName}
        doctorName={doctorName}
        dateStr={dateStr}
        timeRangeStr={timeRangeStr}
        appointmentId={appointmentId}
        chatToken={chatToken}
        baseUrl={baseUrl}
      />
    );
  } else {
    element = (
      <AppointmentConfirmedEmail
        patientName={patientName}
        serviceName={serviceName}
        doctorName={doctorName}
        dateStr={dateStr}
        timeRangeStr={timeRangeStr}
        appointmentId={appointmentId}
        chatToken={chatToken}
        baseUrl={baseUrl}
      />
    );
  }

  const htmlString = renderToStaticMarkup(element);

  return (
    <iframe
      srcDoc={htmlString}
      title="Email Preview"
      className="w-full h-[480px] border-0 bg-white"
    />
  );
}
