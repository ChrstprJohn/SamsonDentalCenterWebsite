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
  const dateStr = safePayload.dateStr || safePayload.appointmentDate || safePayload.preferredDate || 'Jun 4, 2026';
  const timeRangeStr = safePayload.timeRangeStr || safePayload.preferredStartTime || '09:00 AM - 09:30 AM';
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
  } else if (eventType === 'APPOINTMENT_BOOKED' || eventType === 'APPOINTMENT_INQUIRY_RECEIVED' || eventType.includes('INQUIRY') || eventType.includes('REQUEST_RECEIVED')) {
    if (eventType === 'REJECT_INQUIRY') {
      element = (
        <RequestRejectedEmail
          patientName={patientName}
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
        dateStr={dateStr}
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
