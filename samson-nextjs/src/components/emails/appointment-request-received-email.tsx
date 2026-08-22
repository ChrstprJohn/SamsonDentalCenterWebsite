import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import {
  EmailBranding,
  EmailLegalFooter,
  EmailLogoHeader,
  EmailSignature,
  resolveEmailBranding,
} from './email-branding';
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

const fontFamily = 'Arial, Helvetica, sans-serif';

const pStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#1a1a1a',
  fontSize: 14,
  lineHeight: 1.7,
  fontFamily,
};

const boldStyle: React.CSSProperties = {
  fontWeight: 700,
  color: '#1a1a1a',
  fontFamily,
};

const linkStyle: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'underline',
  fontWeight: 600,
  fontFamily,
};

const cardStyle: React.CSSProperties = {
  margin: '0 0 20px',
  padding: '16px 20px',
  backgroundColor: '#f8fafc',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  fontFamily,
};

const labelCellStyle: React.CSSProperties = {
  width: 130,
  padding: '6px 12px 6px 0',
  verticalAlign: 'top' as const,
  fontWeight: 700,
  fontSize: 14,
  color: '#1a1a1a',
  whiteSpace: 'nowrap' as const,
  fontFamily,
};

const valueCellStyle: React.CSSProperties = {
  padding: '6px 0',
  verticalAlign: 'top' as const,
  fontSize: 14,
  color: '#1a1a1a',
  lineHeight: 1.6,
  textAlign: 'right' as const,
  fontFamily,
};

const listStyle: React.CSSProperties = {
  margin: '0 0 16px',
  paddingLeft: 20,
  listStyle: 'disc',
  color: '#1a1a1a',
  fontSize: 14,
  lineHeight: 1.7,
  fontFamily,
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
  const displayLocation = b.locationLine
    ? b.locationLine.replace(new RegExp(`^${b.clinicName},?\\s*`, 'i'), '').trim() || b.locationLine
    : '';

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`
          :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
          }
          .eml-body { padding: 36px 36px 44px; }
          .eml-logo { width: 130px; }
          .dark-logo { display: none !important; }
          .light-logo { display: block !important; }
          @media (prefers-color-scheme: dark) {
            .dark-logo {
              display: block !important;
              max-height: none !important;
              font-size: unset !important;
              line-height: normal !important;
              overflow: visible !important;
            }
            .light-logo { display: none !important; }
          }
          [data-ogsc] .dark-logo, [data-ogsb] .dark-logo {
            display: block !important;
            max-height: none !important;
            font-size: unset !important;
            line-height: normal !important;
            overflow: visible !important;
          }
          [data-ogsc] .light-logo, [data-ogsb] .light-logo {
            display: none !important;
          }
          @media only screen and (max-width: 480px) {
            .eml-body { padding: 24px 20px 32px !important; }
            .eml-logo { width: 100px !important; }
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily, margin: '0', padding: '0' }}>
        <Container className="eml-body" style={{ maxWidth: '720px', margin: '0 auto', padding: '36px 36px 44px' }}>

          {/* Logo */}
          <EmailLogoHeader branding={b} />

          {/* Greeting */}
          <Text style={pStyle}>
            Dear <span style={boldStyle}>{effectiveName}</span>,
          </Text>

          {/* Intro */}
          <Text style={pStyle}>
            {`Thank you for reaching out to ${b.clinicName}. Your booking request has been received, and our staff is reviewing it.`}
          </Text>

          {/* Request details card */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>Here is a copy of your request:</Text>
            <div style={cardStyle}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily }}>
                <tbody>
                  <tr>
                    <td style={labelCellStyle}>Status:</td>
                    <td style={{ ...valueCellStyle, fontWeight: 700, color: '#2563eb' }}>Pending Review</td>
                  </tr>
                  {dateStr && (
                    <tr>
                      <td style={labelCellStyle}>Preferred date:</td>
                      <td style={valueCellStyle}>{dateStr}</td>
                    </tr>
                  )}
                  {effectiveTime && (
                    <tr>
                      <td style={labelCellStyle}>Preferred time:</td>
                      <td style={valueCellStyle}>{effectiveTime}</td>
                    </tr>
                  )}
                  {serviceName && (
                    <tr>
                      <td style={labelCellStyle}>Service:</td>
                      <td style={valueCellStyle}>{serviceName}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={labelCellStyle}>Location:</td>
                    <td style={valueCellStyle}>{displayLocation}</td>
                  </tr>
                  {appointmentId && (
                    <tr>
                      <td style={labelCellStyle}>Reference ID:</td>
                      <td style={valueCellStyle}>{formatRefId(appointmentId)}</td>
                    </tr>
                  )}
                  {patientNote && (
                    <tr>
                      <td style={labelCellStyle}>Your note:</td>
                      <td style={valueCellStyle}>{patientNote}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>

          {/* What happens next */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>What happens next?</Text>
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>Our staff reviews your request.</li>
              <li style={{ marginBottom: 6 }}>Confirmation is sent by email or text.</li>
              <li>No action needed from you — we&apos;ll be in touch.</li>
            </ul>
          </Section>

          {/* Need Help */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>Need Help?</Text>
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>
                Questions? Call/text us at{' '}
                <span style={boldStyle}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={boldStyle}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <Link href={b.websiteUrl} target="_blank" rel="noreferrer" style={linkStyle}>{b.websiteLabel}</Link>.
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

