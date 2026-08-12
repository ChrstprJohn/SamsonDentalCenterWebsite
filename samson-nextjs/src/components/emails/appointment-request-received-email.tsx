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

import { EmailBranding, EmailLegalFooter, EmailSignature, resolveEmailBranding } from './email-branding';
import { formatRefId } from '@/shared/utils/date.util';

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
  preferredStartTimeStr?: string;
  appointmentId?: string;
  patientNote?: string;
  dashboardUrl?: string;
  baseUrl?: string;
  branding?: EmailBranding;
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
  doctorName = '',
  dateStr = 'Monday, June 22, 2026',
  timeRangeStr = '2:00 PM – 2:45 PM',
  preferredStartTimeStr = '',
  appointmentId = 'APT-SAMPLE',
  patientNote = '',
  baseUrl = 'http://localhost:3000',
branding,
}: AppointmentRequestReceivedEmailProps) => {
  const previewText = 'Our staff is reviewing your requested time. We will reach out shortly.';
  const b = branding ?? resolveEmailBranding(undefined, baseUrl);
  const effectiveName = patientName || accountHolderName;
  const effectiveTime = preferredStartTimeStr || timeRangeStr;

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', margin: '0', padding: '0' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '36px 40px 48px' }}>
          
          {/* Logo */}
          <Section style={{ marginBottom: '28px', textAlign: 'center' }}>
            <Img
              src={b.logoUrl}
              alt={b.clinicName}
              width="130"
              style={{ height: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }}
            />
          </Section>

          {/* Greeting */}
          <Text style={pStyle}>
            Dear <span style={boldStyle}>{effectiveName}</span>,
          </Text>

          {/* Intro */}
          <Text style={pStyle}>
            {`Thank you for reaching out to ${b.clinicName}. Your booking request has been received, and our staff is reviewing it.`}
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
            {dateStr && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Preferred date:</span> {dateStr}
              </Text>
            )}
            {effectiveTime && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Preferred time:</span> {effectiveTime}
              </Text>
            )}
            {appointmentId && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Reference ID:</span> {formatRefId(appointmentId)}
              </Text>
            )}
            <Text style={{ ...pStyle, margin: '0 0 4px' }}>
              <span style={boldStyle}>Location:</span> {b.locationLine}{b.mapUrl ? <> (<Link href={b.mapUrl} style={linkStyle}>View on Google Maps</Link>)</> : null}
            </Text>
            {patientNote && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Your note:</span> {patientNote}
              </Text>
            )}
          </Section>

          {/* What happens next */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>What happens next?</Text>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: '14px', lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>Our staff reviews your request.</li>
              <li style={{ marginBottom: 6 }}>Confirmation is sent by email or text.</li>
              <li>No action needed from you — we&apos;ll be in touch.</li>
            </ul>
          </Section>

          {/* Need Help */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>Need Help?</Text>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: '14px', lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>
                Questions? Call/text us at{' '}
                <Link href={b.phoneHref} style={linkStyle}>{b.phone}</Link>.
              </li>
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </Section>

          {/* Closing */}
          <Text style={{ ...pStyle, marginBottom: '24px' }}>
            {`Thank you for choosing ${b.clinicName}.`}
          </Text>

          {/* Signature */}
          <Text style={{ ...pStyle, marginBottom: '4px' }}>Warm regards,</Text>
                    <EmailSignature branding={b} />

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0 20px' }} />

          {/* Footer */}
                    <EmailLegalFooter branding={b} baseUrl={baseUrl} variant="inquiry" />

        </Container>
      </Body>
    </Html>
  );
};

export default AppointmentRequestReceivedEmail;
