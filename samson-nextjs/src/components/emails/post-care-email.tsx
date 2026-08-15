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

export interface PostCareEmailProps {
  patientName?: string;
  serviceName?: string;
  doctorName?: string;
  dateStr?: string;
  appointmentId?: string;
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

export const PostCareEmail = ({
  patientName = 'Valued Patient',
  serviceName = 'Dental Consultation & Cleaning',
  doctorName = 'Dr. Adrian Samson',
  dateStr = 'Monday, June 22, 2026',
  appointmentId = 'APT-SAMPLE',
  baseUrl = 'http://localhost:3000',
branding,
}: PostCareEmailProps) => {
  const previewText = 'We hope your visit went smoothly. Please share how your experience was.';
  const b = branding ?? resolveEmailBranding(undefined, baseUrl);
  const feedbackUrl = `${baseUrl}/review?ref=${appointmentId}`;

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
            Dear <span style={boldStyle}>{patientName}</span>,
          </Text>

          {/* Intro */}
          <Text style={pStyle}>
            {`Thank you for visiting ${b.clinicName}. We hope your visit went smoothly and that you are feeling great.`}
          </Text>

          {/* Summary Details */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>
              Your recent visit:
            </Text>
            <Text style={{ ...pStyle, margin: '0 0 4px' }}>
              <span style={boldStyle}>Status:</span>{' '}
              <span style={{ fontWeight: 700, color: '#0f766e' }}>Completed</span>
            </Text>
            {doctorName && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Doctor:</span> {doctorName}
              </Text>
            )}
            {serviceName && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Service:</span> {serviceName}
              </Text>
            )}
            <Text style={{ ...pStyle, margin: '0 0 4px' }}>
              <span style={boldStyle}>Location:</span> {b.locationLine}{b.mapUrl ? <> (<Link href={b.mapUrl} style={linkStyle}>View on Google Maps</Link>)</> : null}
            </Text>
            {dateStr && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Date:</span> {dateStr}
              </Text>
            )}
            {appointmentId && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Reference ID:</span> {formatRefId(appointmentId)}
              </Text>
            )}
          </Section>

          {/* CTA Link */}
          <Text style={pStyle}>
            If you have a free moment, we would love to hear how your visit went &mdash;{' '}
            <Link href={feedbackUrl} style={linkStyle}>
              click here to share your feedback
            </Link>
            . Your feedback helps us improve our service.
          </Text>

          {/* Quick Reminders checklist */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>Quick Reminders</Text>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: '14px', lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>Follow all post-treatment care instructions from your doctor.</li>
              <li style={{ marginBottom: 6 }}>
                Concerns or questions? Call/text us at{' '}
                <Link href={b.phoneHref} style={linkStyle}>{b.phone}</Link>.
              </li>
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </Section>

          {/* Closing */}
          <Text style={{ ...pStyle, marginBottom: '24px' }}>
            {`Thank you for choosing ${b.clinicName}. We hope to see you again soon.`}
          </Text>

          {/* Signature */}
          <Text style={{ ...pStyle, marginBottom: '4px' }}>Warm regards,</Text>
                    <EmailSignature branding={b} />

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0 20px' }} />

          {/* Footer */}
                    <EmailLegalFooter branding={b} baseUrl={baseUrl} variant="appointment" />

        </Container>
      </Body>
    </Html>
  );
};

export default PostCareEmail;
