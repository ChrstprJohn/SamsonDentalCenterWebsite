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
import { formatRefId } from '@/shared/utils/date.util';

export interface RequestRejectedEmailProps {
  patientName?: string;
  serviceName?: string;
  dateStr?: string;
  timeRangeStr?: string;
  preferredStartTimeStr?: string;
  appointmentId?: string;
  rejectionReason?: string;
  rebookUrl?: string;
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

export const RequestRejectedEmail = ({
  patientName = 'Valued Patient',
  serviceName = '',
  dateStr = '',
  timeRangeStr = '',
  preferredStartTimeStr = '',
  appointmentId = '',
  rejectionReason = 'Unfortunately, we are unable to accommodate your request at this time.',
  rebookUrl = '',
  baseUrl = 'http://localhost:3000',
}: RequestRejectedEmailProps) => {
  const previewText = 'We cannot accommodate this request. Contact our clinic to explore other options.';
  const logoUrl = getLogoUrl(baseUrl);
  const effectiveTime = preferredStartTimeStr || timeRangeStr;
  const effectiveRebookUrl = rebookUrl || `${baseUrl}/book`;

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
            Dear <span style={boldStyle}>{patientName}</span>,
          </Text>

          {/* Intro */}
          <Text style={pStyle}>
            Thank you for your interest in Samson Dental Center. After carefully reviewing your booking request, we regret to inform you that we are unable to accommodate your request at this time.
          </Text>

          <Text style={pStyle}>
            We sincerely apologize for any inconvenience this may cause.
          </Text>

          <Text style={pStyle}>
            Rejection reason: <span style={boldStyle}>{rejectionReason}</span>
          </Text>

          {/* Rejection details section */}
          {(serviceName || dateStr || effectiveTime) && (
            <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
              <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>
                Your request:
              </Text>
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Status:</span>{' '}
                <span style={{ fontWeight: 700, color: '#dc2626' }}>Rejected</span>
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
            </Section>
          )}

          {/* Need Help */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>Need Help?</Text>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: '14px', lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>
                Request a different date or time — call/text us at{' '}
                <Link href="tel:028123456" style={linkStyle}>(02) 8123-4567</Link>.
              </li>
              {effectiveRebookUrl && (
                <li style={{ marginBottom: 6 }}>
                  Ready to book again?{' '}
                  <Link href={effectiveRebookUrl} target="_blank" rel="noreferrer" style={linkStyle}>
                    Click here to make a new request
                  </Link>.
                </li>
              )}
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </Section>

          {/* Closing */}
          <Text style={{ ...pStyle, marginBottom: '24px' }}>
            Thank you for choosing Samson Dental Center.
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

export default RequestRejectedEmail;
