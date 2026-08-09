import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import { getLogoUrl } from '@/shared/utils/get-base-url.util';

export interface AppointmentRequestReceivedEmailProps {
  accountHolderName?: string;
  patientType?: 'SELF' | 'DEPENDENT';
  patientName?: string;
  relationship?: string;
  bookedByName?: string;
  serviceName?: string;
  doctorName?: string;
  dateStr?: string;
  timeRangeStr?: string;
  appointmentId?: string;
  dashboardUrl?: string;
  baseUrl?: string;
}

const pStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: 1.75,
};

const boldStyle: React.CSSProperties = {
  fontWeight: 700,
};

const linkStyle: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'underline',
  fontWeight: 600,
};

export const AppointmentRequestReceivedEmail = ({
  accountHolderName = 'Valued Patient',
  patientName = 'Valued Patient',
  serviceName = 'Dental Consultation & Cleaning',
  doctorName = 'Dr. Adrian Samson',
  dateStr = 'Monday, June 22, 2026',
  timeRangeStr = '2:00 PM – 2:45 PM',
  appointmentId = 'APT-SAMPLE',
  baseUrl = 'http://localhost:3000',
}: AppointmentRequestReceivedEmailProps) => {
  const previewText = 'Thank you for reaching out. We will review your request and be in touch shortly.';
  const logoUrl = getLogoUrl(baseUrl);

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', margin: '0', padding: '0' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '36px 40px 48px' }}>
          
          {/* Logo */}
          <Section style={{ marginBottom: '28px', textAlign: 'center' }}>
            <Img
              src={logoUrl}
              alt="Samson Dental Center"
              width="130"
              style={{ height: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }}
            />
          </Section>

          {/* Greeting */}
          <Text style={pStyle}>
            Dear <span style={boldStyle}>{patientName || accountHolderName}</span>,
          </Text>

          {/* Intro */}
          <Text style={pStyle}>
            Thank you for reaching out to Samson Dental Center. We have successfully received your booking request and our team is currently reviewing it. We will get back to you as soon as possible to confirm your appointment details.
          </Text>



          {/* Details list */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>
              Here is a copy of your request:
            </Text>
            <Text style={{ ...pStyle, margin: '0 0 4px' }}>
              <span style={boldStyle}>Status:</span>{' '}
              <span style={{ fontWeight: 700, color: '#2563eb' }}>Pending Review</span>
            </Text>
            {serviceName && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Service:</span> {serviceName}
              </Text>
            )}
            {doctorName && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Doctor:</span> {doctorName}
              </Text>
            )}
            <Text style={{ ...pStyle, margin: '0 0 4px' }}>
              <span style={boldStyle}>Location:</span> Samson Dental Center, Quezon City, Metro Manila
            </Text>
            {dateStr && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Preferred Date:</span> {dateStr}
              </Text>
            )}
            {timeRangeStr && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Preferred Time:</span> {timeRangeStr}
              </Text>
            )}
            {appointmentId && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Reference ID:</span> {appointmentId}
              </Text>
            )}
          </Section>

          {/* Contact block */}
          <Text style={pStyle}>
            If you have any questions or would like to reschedule a future appointment, please don&apos;t hesitate to call or text us at{' '}
            <Link href="tel:028123456" style={linkStyle}>(02) 8123-4567</Link>.{' '}
            <span style={{ color: '#dc2626', fontWeight: 600 }}>Please note that replies to this email are not monitored.</span>
          </Text>

          {/* Closing */}
          <Text style={{ ...pStyle, marginBottom: '24px' }}>
            Thank you for choosing Samson Dental Center. We look forward to welcoming you soon.
          </Text>

          {/* Signature */}
          <Text style={{ ...pStyle, marginBottom: '4px' }}>Warm regards,</Text>
          <Text style={{ ...pStyle, marginBottom: '2px', ...boldStyle }}>Samson Dental Center</Text>
          <Text style={{ ...pStyle, color: '#64748b', marginBottom: 0 }}>
            (02) 8123-4567 &nbsp;&middot;&nbsp;{' '}
            <Link href={baseUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
              samsondentalcenter.com.ph
            </Link>
          </Text>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0 20px' }} />

          {/* Footer */}
          <Text style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
            You received this email because you submitted a booking inquiry with Samson Dental Center. If you believe this was sent in error, please contact our office.{' '}
            <Link href={`${baseUrl}/terms`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>
              Terms of Service
            </Link>{' '}
            &middot;{' '}
            <Link href={`${baseUrl}/privacy`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>
              Privacy Policy
            </Link>
          </Text>

        </Container>
      </Body>
    </Html>
  );
};

export default AppointmentRequestReceivedEmail;
