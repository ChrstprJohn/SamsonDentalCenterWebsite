'use client';

import React from 'react';
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
  const patientName = payload.patientName || payload.accountHolderName || payload.firstName || 'Valued Patient';
  const serviceName = payload.serviceName || 'Dental Treatment';
  const doctorName = payload.doctorName || 'Dr. Assigned Dentist';
  const dateStr = payload.dateStr || payload.appointmentDate || 'Jun 4, 2026';
  const timeRangeStr = payload.timeRangeStr || '09:00 AM - 09:30 AM';
  const appointmentId = payload.appointmentId || 'APT-SAMPLE';
  const otpCode = payload.otpCode || '123456';
  const chatToken = payload.chatToken || '';
  const baseUrl = payload.baseUrl || 'http://localhost:3000';
  const cancellationReason = payload.cancellationReason || payload.reason;
  const rejectionReason = payload.rejectionReason || payload.reason;

  if (eventType === 'PATIENT_REGISTERED') {
    return <SignupOtpEmail firstName={patientName} otpCode={otpCode} />;
  }

  if (eventType === 'PASSWORD_RESET_REQUESTED') {
    return <ResetPasswordOtpEmail firstName={patientName} otpCode={otpCode} />;
  }

  if (eventType === 'APPOINTMENT_BOOKED' || eventType.includes('REQUEST_RECEIVED')) {
    return (
      <AppointmentRequestReceivedEmail
        accountHolderName={payload.accountHolderName || patientName}
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

  if (eventType === 'CANCEL_BOOKING' || eventType === 'CANCEL_BOOKING_SMS') {
    return (
      <AppointmentCancelledEmail
        patientName={patientName}
        dateStr={dateStr}
        cancellationReason={cancellationReason}
        baseUrl={baseUrl}
      />
    );
  }

  if (eventType === 'RESCHEDULE_BOOKING' || eventType === 'RESCHEDULE_BOOKING_SMS') {
    return (
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
  }

  if (eventType === 'STAFF_REPLIED_TO_CHAT') {
    return (
      <StaffReplyEmail
        patientName={patientName}
        chatToken={chatToken}
        baseUrl={baseUrl}
      />
    );
  }

  if (eventType === 'APPOINTMENT_COMPLETED_POST_CARE' || eventType === 'APPOINTMENT_COMPLETED_POST_CARE_SMS') {
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
  }

  if (eventType === 'REJECT_INQUIRY') {
    return (
      <RequestRejectedEmail
        patientName={patientName}
        rejectionReason={rejectionReason}
        baseUrl={baseUrl}
      />
    );
  }

  if (eventType.startsWith('APPOINTMENT_REMINDER')) {
    const reminderTitle = eventType.includes('24H') ? '24-hour Reminder' : '48-hour Reminder';
    return (
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
  }

  // Fallback to AppointmentConfirmedEmail for converted or manually booked appointments
  return (
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
