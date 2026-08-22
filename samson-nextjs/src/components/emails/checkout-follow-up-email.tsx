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

export interface CheckoutFollowUpEmailProps {
  patientName?: string;
  serviceName?: string;
  doctorName?: string;
  dateStr?: string;
  appointmentId?: string;
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

export const CheckoutFollowUpEmail = ({
  patientName = 'Valued Patient',
  serviceName = 'Dental Consultation & Cleaning',
  doctorName = 'Dr. Adrian Samson',
  dateStr = 'Monday, June 22, 2026',
  appointmentId = 'APT-SAMPLE',
  baseUrl = 'http://localhost:3000',
  branding,
}: CheckoutFollowUpEmailProps) => {
  const previewText = 'Hello! We want to check in on how you are feeling after your visit.';
  const b = branding ?? resolveEmailBranding(undefined, baseUrl);
  const wellbeingUrl = `${baseUrl}/wellbeing?ref=${appointmentId}`;
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
            Dear <span style={boldStyle}>{patientName}</span>,
          </Text>

          {/* Intro */}
          <Text style={pStyle}>
            {`It's been 2 days since your visit at ${b.clinicName}, we hope your recovery is going well. Take 30 seconds to let us know how you're feeling today.`}
          </Text>

          {/* Recent visit details card */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>Your recent visit:</Text>
            <div style={cardStyle}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily }}>
                <tbody>
                  <tr>
                    <td style={labelCellStyle}>Status:</td>
                    <td style={{ ...valueCellStyle, fontWeight: 700, color: '#0f766e' }}>Completed</td>
                  </tr>
                  {dateStr && (
                    <tr>
                      <td style={labelCellStyle}>Date:</td>
                      <td style={valueCellStyle}>{dateStr}</td>
                    </tr>
                  )}
                  {serviceName && (
                    <tr>
                      <td style={labelCellStyle}>Service:</td>
                      <td style={valueCellStyle}>{serviceName}</td>
                    </tr>
                  )}
                  {doctorName && (
                    <tr>
                      <td style={labelCellStyle}>Doctor:</td>
                      <td style={valueCellStyle}>{doctorName}</td>
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

          {/* Wellbeing CTA */}
          <Text style={pStyle}>
            How are you feeling today? Take a moment to let us know:{' '}
            <Link href={wellbeingUrl} style={linkStyle}>Tell us how you&apos;re feeling</Link>. Your response helps our team support your recovery.
          </Text>

          {/* Quick Reminders */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>Quick Reminders</Text>
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>Follow all post-treatment care instructions from your doctor.</li>
              <li style={{ marginBottom: 6 }}>
                Concerns or questions? Call/text us at{' '}
                <span style={boldStyle}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={boldStyle}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <Link href={b.websiteUrl} target="_blank" rel="noreferrer" style={linkStyle}>{b.websiteLabel}</Link>.
              </li>
              <li style={{ marginTop: 6 }}>
                If you are experiencing a severe emergency, call us immediately at{' '}
                <span style={boldStyle}>{b.phone}</span>{' '}
                or visit the nearest emergency room.
              </li>
            </ul>
          </Section>

          {/* Closing */}
          <Text style={{ ...pStyle, marginBottom: '24px' }}>
            {`We hope you are feeling well. Thank you for trusting ${b.clinicName} with your care.`}
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

export default CheckoutFollowUpEmail;