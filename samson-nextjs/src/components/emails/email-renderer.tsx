'use client';

import React from 'react';

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
  const appointmentId = payload.appointmentId || 'f616dc57-4194-428c-901b-2e30205c97e4';
  const otpCode = payload.otpCode || '123456';
  const chatToken = payload.chatToken || '';
  const baseUrl = payload.baseUrl || 'http://localhost:3000';

  const isConfirmed = eventType === 'APPOINTMENT_BOOKED' || eventType === 'APPOINTMENT_MANUALLY_BOOKED_PATIENT' || eventType === 'APPOINTMENT_MANUALLY_BOOKED_GUEST' || eventType === 'APPOINTMENT_CONVERTED_FROM_INQUIRY';
  const isReminder = eventType.startsWith('APPOINTMENT_REMINDER');
  const isRescheduled = eventType === 'RESCHEDULE_BOOKING' || eventType === 'RESCHEDULE_BOOKING_SMS';
  const isCancelled = eventType === 'CANCEL_BOOKING' || eventType === 'CANCEL_BOOKING_SMS';
  const isOtp = eventType === 'PATIENT_REGISTERED' || eventType === 'PASSWORD_RESET_REQUESTED';
  const isStaffReply = eventType === 'STAFF_REPLIED_TO_CHAT';
  const isRequestReceived = eventType.includes('REQUEST_RECEIVED');
  const isSms = eventType.endsWith('_SMS');

  const topBorderColor = isCancelled ? '#ef4444' : isRescheduled ? '#3b82f6' : isConfirmed ? '#16a34a' : '#3b82f6';
  const subTitle = isConfirmed
    ? 'Appointment Confirmed'
    : isReminder
      ? (eventType.includes('24H') ? '24-Hour Reminder' : '48-Hour Reminder')
      : isRescheduled
        ? (isSms ? 'Appointment Rescheduled (SMS)' : 'Appointment Rescheduled')
        : isCancelled
          ? (isSms ? 'Appointment Cancelled (SMS)' : 'Appointment Cancelled')
          : isOtp
            ? (eventType === 'PATIENT_REGISTERED' ? 'Welcome & Verification' : 'Password Reset')
            : isStaffReply
              ? 'New Message Received'
              : isRequestReceived
                ? 'Appointment Request Received'
                : 'Notification Dispatch';

  return (
    <div style={{ backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '24px 12px', margin: '0' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px 8px 0 0', padding: '32px 40px 24px', borderTop: `4px solid ${topBorderColor}`, textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.3px' }}>
            Samson Dental Center
          </h1>
          <p style={{ margin: '0', fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {subTitle}
          </p>
        </div>

        {/* Body */}
        <div style={{ backgroundColor: '#ffffff', padding: '0 40px 32px' }}>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 8px' }}>
            Dear {patientName},
          </p>

          {isOtp ? (
            <>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 16px' }}>
                {eventType === 'PATIENT_REGISTERED'
                  ? 'Thank you for registering. To complete your sign-up process, please use the verification code below:'
                  : 'We received a request to reset your password. Please use the verification code below to complete the process:'}
              </p>
              <div style={{ backgroundColor: '#eff6ff', borderRadius: '6px', padding: '16px', margin: '24px 0', textAlign: 'center' }}>
                <span style={{ color: '#2563eb', fontSize: '32px', fontWeight: '700', letterSpacing: '0.2em' }}>
                  {otpCode}
                </span>
              </div>
            </>
          ) : isCancelled ? (
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 24px' }}>
              As requested, your appointment scheduled for <strong>{dateStr}</strong> has been successfully cancelled. We hope you feel better!
            </p>
          ) : isRescheduled ? (
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 24px' }}>
              Your appointment has been successfully rescheduled to <strong>{dateStr}</strong> at <strong>{timeRangeStr}</strong>. You can view the details and manage your appointment using the link below:
            </p>
          ) : isStaffReply ? (
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 24px' }}>
              Our clinic staff has sent a new message regarding your appointment. You can view the message and reply directly in the secure chat thread:
            </p>
          ) : (
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 28px' }}>
              {isConfirmed
                ? 'Your appointment at Samson Dental Center has been scheduled and confirmed. We look forward to seeing you. Please find the details of your appointment below:'
                : `This is a friendly reminder regarding your upcoming appointment at Samson Dental Center on ${dateStr} at ${timeRangeStr}.`}
            </p>
          )}

          {/* Appointment Details Box */}
          {!isOtp && !isCancelled && (
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px 24px', marginBottom: '28px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                Appointment Summary
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#6b7280', fontSize: '13px', minWidth: '140px' }}>Patient Name</span>
                <span style={{ color: '#111827', fontSize: '13px', fontWeight: '600', textAlign: 'right', flex: 1 }}>{patientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#6b7280', fontSize: '13px', minWidth: '140px' }}>Treatment Service</span>
                <span style={{ color: '#111827', fontSize: '13px', fontWeight: '600', textAlign: 'right', flex: 1 }}>{serviceName}</span>
              </div>
              {doctorName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px', minWidth: '140px' }}>Assigned Doctor</span>
                  <span style={{ color: '#111827', fontSize: '13px', fontWeight: '600', textAlign: 'right', flex: 1 }}>{doctorName}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#6b7280', fontSize: '13px', minWidth: '140px' }}>Appointment Date</span>
                <span style={{ color: '#111827', fontSize: '13px', fontWeight: '600', textAlign: 'right', flex: 1 }}>{dateStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#6b7280', fontSize: '13px', minWidth: '140px' }}>Confirmed Time</span>
                <span style={{ color: '#111827', fontSize: '13px', fontWeight: '600', textAlign: 'right', flex: 1 }}>{timeRangeStr}</span>
              </div>

              {appointmentId && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ margin: '0', fontSize: '11px', color: '#9ca3af' }}>Reference ID</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', fontFamily: 'monospace', color: '#6b7280', wordBreak: 'break-all' }}>{appointmentId}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          {chatToken && (
            <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '24px' }}>
              <a
                href={`${baseUrl}/manage?token=${chatToken}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '6px',
                  color: '#ffffff',
                  display: 'inline-block',
                  fontSize: '13px',
                  fontWeight: '600',
                  lineHeight: '44px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  width: '100%',
                }}
              >
                Manage Appointment
              </a>
            </div>
          )}

          {/* Important Instructions for Confirmed/Reminders */}
          {(isConfirmed || isReminder) && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                Important Instructions
              </p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a', minWidth: '20px' }}>•</span>
                <p style={{ margin: '0', fontSize: '13px', color: '#374151', lineHeight: '20px' }}>
                  Please arrive <strong style={{ color: '#111827' }}>10–15 minutes early</strong> to complete any necessary paperwork.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a', minWidth: '20px' }}>•</span>
                <p style={{ margin: '0', fontSize: '13px', color: '#374151', lineHeight: '20px' }}>
                  If you need to reschedule or cancel, please contact the clinic at least 24 hours in advance.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#f1f5f9', borderRadius: '0 0 8px 8px', padding: '20px 40px', textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #e2e8f0', margin: '0 0 16px' }} />
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#94a3b8' }}>
            © {new Date().getFullYear()} Samson Dental Center. All rights reserved.
          </p>
          <p style={{ margin: '0', fontSize: '11px', color: '#94a3b8' }}>
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  );
}
