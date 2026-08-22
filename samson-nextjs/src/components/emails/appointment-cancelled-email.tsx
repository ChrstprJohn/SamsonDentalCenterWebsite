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

export interface AppointmentCancelledEmailProps {
  patientName?: string;
  serviceName?: string;
  dateStr?: string;
  timeRangeStr?: string;
  appointmentId?: string;
  cancellationReason?: string;
  rebookUrl?: string;
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
  margin: '0 0 16px',
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

export const AppointmentCancelledEmail = ({
  patientName = 'Valued Patient',
  serviceName = 'Dental Consultation & Cleaning',
  dateStr = 'Monday, June 22, 2026',
  timeRangeStr = '2:00 PM – 2:45 PM',
  appointmentId = 'APT-SAMPLE',
  cancellationReason = 'Clinic schedule conflict.',
  rebookUrl = '',
  baseUrl = 'http://localhost:3000',
  branding,
}: AppointmentCancelledEmailProps) => {
  const previewText = 'We hope to see you again soon. Feel free to rebook whenever you are ready.';
  const b = branding ?? resolveEmailBranding(undefined, baseUrl);
  const effectiveRebookUrl = rebookUrl || `${baseUrl}/book`;
  const displayLocation = b.locationLine
    ? b.locationLine.replace(new RegExp(`^${b.clinicName},?\\s*`, 'i'), '').trim() || b.locationLine
    : '';
  const referenceCode = formatRefId(appointmentId);

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
            .dark-logo { display: block !important; }
            .light-logo { display: none !important; }
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
            Dear <span style={boldStyle}>{patientName}</span>,
          </Text>

          {/* Intro */}
          <Text style={pStyle}>
            {`Your appointment at ${b.clinicName} has been cancelled. Please see the appointment details below.`}
          </Text>

          {/* Cancelled appointment details */}
          <Section style={{ margin: '0 0 16px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>Your cancelled appointment:</Text>
            <div style={cardStyle}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily }}>
                <tbody>
                  {dateStr && (
                    <tr>
                      <td style={labelCellStyle}>Date:</td>
                      <td style={valueCellStyle}>{dateStr}</td>
                    </tr>
                  )}
                  {timeRangeStr && (
                    <tr>
                      <td style={labelCellStyle}>Time:</td>
                      <td style={valueCellStyle}>{timeRangeStr}</td>
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
                  {referenceCode && (
                    <tr>
                      <td style={labelCellStyle}>Reference ID:</td>
                      <td style={valueCellStyle}>{referenceCode}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>

          {cancellationReason && (
            <Text style={pStyle}>
              Cancellation reason: <span style={boldStyle}>{cancellationReason}</span>
            </Text>
          )}

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
              {effectiveRebookUrl && (
                <li style={{ marginBottom: 6 }}>
                  Ready to book again?{' '}
                  <Link href={effectiveRebookUrl} target="_blank" rel="noreferrer" style={linkStyle}>
                    Click here to make a new request
                  </Link>.
                </li>
              )}
            </ul>
          </Section>

          {/* Closing */}
          <Text style={{ ...pStyle, marginBottom: '24px' }}>
            {`Thank you for letting us know, and we hope to welcome you back at ${b.clinicName} soon.`}
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

export default AppointmentCancelledEmail;

