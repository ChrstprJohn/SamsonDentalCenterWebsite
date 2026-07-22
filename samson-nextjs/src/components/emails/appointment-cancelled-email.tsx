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

interface AppointmentCancelledEmailProps {
  patientName: string;
  dateStr: string;
}

export const AppointmentCancelledEmail = ({
  patientName = 'Patient Name',
  dateStr = 'Jun 4, 2026',
}: AppointmentCancelledEmailProps) => {
  const previewText = `Your appointment at Samson Dental Center has been cancelled.`;

  return (
    <Tailwind>
      <Html lang="en">
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={{ backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: '0', padding: '0' }}>
          <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '0 16px' }}>

            {/* Header */}
            <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px 8px 0 0', padding: '32px 40px 24px', borderTop: '4px solid #ef4444', textAlign: 'center' }}>
              <Heading style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.3px' }}>
                Samson Dental Center
              </Heading>
              <Text style={{ margin: '0', fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Appointment Cancelled
              </Text>
            </Section>

            {/* Body */}
            <Section style={{ backgroundColor: '#ffffff', padding: '0 40px 32px' }}>
              <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 8px' }}>
                Dear {patientName},
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '22px', margin: '0 0 24px' }}>
                As requested, your appointment scheduled for <strong>{dateStr}</strong> has been successfully cancelled. We hope you feel better!
              </Text>
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

export default AppointmentCancelledEmail;
