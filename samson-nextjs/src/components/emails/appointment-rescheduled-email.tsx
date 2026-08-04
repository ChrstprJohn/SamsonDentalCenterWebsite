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

interface AppointmentRescheduledEmailProps {
  patientName: string;
  dateStr: string;
  timeRangeStr: string;
  chatToken: string;
  baseUrl: string;
}

export const AppointmentRescheduledEmail = ({
  patientName = 'Patient Name',
  dateStr = 'Jun 4, 2026',
  timeRangeStr = '10:00 AM',
  chatToken = '',
  baseUrl = 'http://localhost:3000',
}: AppointmentRescheduledEmailProps) => {
  const previewText = `Your appointment at Samson Dental Center has been rescheduled.`;

  return (
    <Tailwind>
      <Html lang="en">
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={{ backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: '0', padding: '0' }}>
          <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '0 16px' }}>

            {/* Header */}
            <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px 8px 0 0', padding: '32px 40px 24px', borderTop: '4px solid #3b82f6', textAlign: 'center' }}>
              <Heading style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.3px' }}>
                Samson Dental Center
              </Heading>
              <Text style={{ margin: '0', fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Appointment Rescheduled
              </Text>
            </Section>

            {/* Body */}
            <Section style={{ backgroundColor: '#ffffff', padding: '0 40px 32px' }}>
              <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 8px' }}>
                Dear {patientName},
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 24px' }}>
                Your appointment has been successfully rescheduled to <strong>{dateStr}</strong> at <strong>{timeRangeStr}</strong>. You can view the details and manage your appointment using the link below:
              </Text>

              {/* Action Button */}
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
                  Manage Appointment
                </a>
              </Section>

              {/* Before Your Visit */}
              <Section style={{ borderLeft: '3px solid #2563eb', paddingLeft: '14px', marginTop: '8px' }}>
                <Text style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Before your visit
                </Text>
                <Text style={{ margin: '0 0 8px', fontSize: '13px', color: '#374151', lineHeight: '20px' }}>
                  <strong style={{ color: '#2563eb' }}>●</strong>{' '}
                  Please arrive 10 to 15 minutes before your scheduled time to complete check-in.
                </Text>
                <Text style={{ margin: '0', fontSize: '13px', color: '#374151', lineHeight: '20px' }}>
                  <strong style={{ color: '#2563eb' }}>●</strong>{' '}
                  If you need to reschedule or have any questions before your visit, reach out through the chat thread above or call our reception desk.
                </Text>
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

export default AppointmentRescheduledEmail;
