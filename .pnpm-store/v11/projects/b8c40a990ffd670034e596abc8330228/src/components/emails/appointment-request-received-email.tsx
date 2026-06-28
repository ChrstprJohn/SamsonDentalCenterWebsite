import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface AppointmentRequestReceivedEmailProps {
  /** Account holder's full name — used for the greeting */
  accountHolderName: string;
  /** Whether the booking is for the account holder or a family member */
  patientType: 'SELF' | 'DEPENDENT';
  /** The patient's full name (self or dependent) */
  patientName: string;
  /** Relationship tag e.g. "Spouse", "Child" — only for DEPENDENT */
  relationship?: string;
  /** Account holder's full name — shown in "Booked By" row for dependents */
  bookedByName?: string;
  serviceName: string;
  doctorName: string;
  dateStr: string;
  timeRangeStr: string;
  appointmentId: string;
  dashboardUrl: string;
}

const row = (label: string, value: React.ReactNode) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0',
    }}
  >
    <span style={{ color: '#6b7280', fontSize: '13px', minWidth: '140px' }}>{label}</span>
    <span style={{ color: '#111827', fontSize: '13px', fontWeight: '600', textAlign: 'right', flex: 1 }}>
      {value}
    </span>
  </div>
);

export const AppointmentRequestReceivedEmail = ({
  accountHolderName = 'Patient',
  patientType = 'SELF',
  patientName = 'Patient Name',
  relationship,
  bookedByName,
  serviceName = 'Dental Treatment',
  doctorName = 'Dr. John Doe',
  dateStr = 'Jun 4, 2026',
  timeRangeStr = '9:00 AM – 9:30 AM',
  appointmentId = 'f616dc57-4194-428c-901b-2e30205c97e4',
  dashboardUrl = 'http://localhost:3000/user',
}: AppointmentRequestReceivedEmailProps) => {
  const isDependent = patientType === 'DEPENDENT';

  const previewText = isDependent
    ? 'A family member booking has been submitted and is pending staff verification.'
    : 'Your request is under staff review. We will notify you once it is confirmed.';

  const openingBody = isDependent
    ? `Thank you for submitting an appointment request on behalf of a family member at Samson Dental Center. We have received it and our administration team is currently reviewing the scheduling details.`
    : `Thank you for submitting your appointment request at Samson Dental Center. We have successfully received it and our administration team is currently verifying the details against the doctor's schedule.`;

  return (
    <Tailwind>
      <Html lang="en">
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={{ backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: '0', padding: '0' }}>
          <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '0 16px' }}>

            {/* Header */}
            <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px 8px 0 0', padding: '32px 40px 24px', borderTop: '4px solid #2563eb', textAlign: 'center' }}>
              <Heading style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.3px' }}>
                Samson Dental Center
              </Heading>
              <Text style={{ margin: '0', fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Appointment Request Received
              </Text>
            </Section>

            {/* Body */}
            <Section style={{ backgroundColor: '#ffffff', padding: '0 40px 32px' }}>

              {/* Greeting */}
              <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 8px' }}>
                Dear {accountHolderName},
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 28px' }}>
                {openingBody}
              </Text>

              {/* Summary Card */}
              <Section style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px 24px', marginBottom: '28px' }}>
                <Text style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  Appointment Summary
                </Text>

                {row('Patient Name', patientName)}
                {isDependent && relationship && row('Relationship', relationship)}
                {isDependent && bookedByName && row('Booked By', bookedByName)}
                {row('Treatment Service', serviceName)}
                {row('Assigned Doctor', doctorName)}
                {row('Appointment Date', dateStr)}
                {row('Requested Time Window', timeRangeStr)}
                {row(
                  'Current Status',
                  <span style={{ color: '#d97706', backgroundColor: '#fef3c7', padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                    Pending Staff Review
                  </span>
                )}

                {/* Appointment ID — muted at the bottom */}
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                  <Text style={{ margin: '0', fontSize: '11px', color: '#9ca3af' }}>
                    Reference ID
                  </Text>
                  <Text style={{ margin: '4px 0 0', fontSize: '11px', fontFamily: 'monospace', color: '#6b7280', wordBreak: 'break-all' }}>
                    {appointmentId}
                  </Text>
                </div>
              </Section>

              {/* What Happens Next */}
              <Text style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                What happens next?
              </Text>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb', minWidth: '20px' }}>1.</span>
                <Text style={{ margin: '0', fontSize: '13px', color: '#374151', lineHeight: '20px' }}>
                  <strong style={{ color: '#111827' }}>Staff Review</strong> — Our clinic secretary will review and verify your requested time slot. This typically takes less than 2 hours during regular clinic hours.
                </Text>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb', minWidth: '20px' }}>2.</span>
                <Text style={{ margin: '0', fontSize: '13px', color: '#374151', lineHeight: '20px' }}>
                  <strong style={{ color: '#111827' }}>Confirmation</strong> — Once your appointment is confirmed, you will receive a separate email notification with your final appointment details.
                </Text>
              </div>

              {/* CTA */}
              <Section style={{ textAlign: 'center', marginBottom: '8px' }}>
                <Link
                  href={dashboardUrl}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    padding: '12px 28px',
                  }}
                >
                  View My Appointments
                </Link>
              </Section>
            </Section>

            {/* Footer */}
            <Section style={{ backgroundColor: '#f1f5f9', borderRadius: '0 0 8px 8px', padding: '20px 40px', textAlign: 'center' }}>
              <Hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 16px' }} />
              <Text style={{ margin: '0 0 4px', fontSize: '12px', color: '#94a3b8' }}>
                © {new Date().getFullYear()} Samson Dental Center. All rights reserved.
              </Text>
              <Text style={{ margin: '0', fontSize: '11px', color: '#94a3b8' }}>
                This is an automated message. Please do not reply to this email.
              </Text>
            </Section>

          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default AppointmentRequestReceivedEmail;
