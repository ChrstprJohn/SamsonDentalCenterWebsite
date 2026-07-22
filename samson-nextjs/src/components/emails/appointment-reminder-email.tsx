import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface AppointmentReminderEmailProps {
  reminderTitle?: string;
  patientName: string;
  serviceName: string;
  doctorName: string;
  dateStr: string;
  timeRangeStr: string;
  appointmentId: string;
  chatToken?: string;
  baseUrl?: string;
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

export const AppointmentReminderEmail = ({
  reminderTitle = 'Upcoming Appointment Reminder',
  patientName = 'Patient Name',
  serviceName = 'Dental Treatment',
  doctorName = 'Dr. Assigned Dentist',
  dateStr = 'Jun 4, 2026',
  timeRangeStr = '9:00 AM – 9:30 AM',
  appointmentId = 'f616dc57-4194-428c-901b-2e30205c97e4',
  chatToken = '',
  baseUrl = 'http://localhost:3000',
}: AppointmentReminderEmailProps) => {
  const previewText = `Reminder: Your appointment at Samson Dental Center is on ${dateStr} at ${timeRangeStr}.`;

  return (
    <Tailwind>
      <Html lang="en">
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={{ backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: '0', padding: '0' }}>
          <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '0 16px' }}>

            {/* Header */}
            <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px 8px 0 0', padding: '32px 40px 24px', borderTop: '4px solid #0284c7', textAlign: 'center' }}>
              <Heading style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.3px' }}>
                Samson Dental Center
              </Heading>
              <Text style={{ margin: '0', fontSize: '12px', color: '#0284c7', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: '700' }}>
                {reminderTitle}
              </Text>
            </Section>

            {/* Body */}
            <Section style={{ backgroundColor: '#ffffff', padding: '0 40px 32px' }}>

              {/* Greeting */}
              <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 8px' }}>
                Dear {patientName},
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 28px' }}>
                This is a friendly reminder of your upcoming dental appointment at Samson Dental Center. Please review your details below:
              </Text>

              {/* Summary Card */}
              <Section style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px 24px', marginBottom: '28px' }}>
                <Text style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  Appointment Summary
                </Text>

                {row('Patient Name', patientName)}
                {row('Treatment Service', serviceName)}
                {row('Assigned Doctor', doctorName)}
                {row('Appointment Date', dateStr)}
                {row('Scheduled Time', timeRangeStr)}
                {row(
                  'Status',
                  <span style={{ color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                    Scheduled
                  </span>
                )}

                {/* Appointment ID */}
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                  <Text style={{ margin: '0', fontSize: '11px', color: '#9ca3af' }}>
                    Reference ID
                  </Text>
                  <Text style={{ margin: '4px 0 0', fontSize: '11px', fontFamily: 'monospace', color: '#6b7280', wordBreak: 'break-all' }}>
                    {appointmentId}
                  </Text>
                </div>
              </Section>

              {chatToken && baseUrl && (
                <Section style={{ textAlign: 'center', marginTop: '24px', marginBottom: '24px' }}>
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
                    View Appointment Details
                  </a>
                </Section>
              )}

              {/* Instructions */}
              <Text style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                Important Instructions
              </Text>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0284c7', minWidth: '20px' }}>•</span>
                <Text style={{ margin: '0', fontSize: '13px', color: '#374151', lineHeight: '20px' }}>
                  Please arrive <strong style={{ color: '#111827' }}>10–15 minutes early</strong> for your appointment.
                </Text>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0284c7', minWidth: '20px' }}>•</span>
                <Text style={{ margin: '0', fontSize: '13px', color: '#374151', lineHeight: '20px' }}>
                  If you need to reschedule or cancel, please contact the clinic at least 24 hours in advance.
                </Text>
              </div>

            </Section>

            {/* Footer */}
            <Section style={{ backgroundColor: '#f1f5f9', borderRadius: '0 0 8px 8px', padding: '20px 40px', textAlign: 'center' }}>
              <Hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 16px' }} />
              <Text style={{ margin: '0 0 4px', fontSize: '12px', color: '#94a3b8' }}>
                © {new Date().getFullYear()} Samson Dental Center. All rights reserved.
              </Text>
              <Text style={{ margin: '0', fontSize: '11px', color: '#94a3b8' }}>
                This is an automated reminder. Please do not reply directly to this email.
              </Text>
            </Section>

          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default AppointmentReminderEmail;
