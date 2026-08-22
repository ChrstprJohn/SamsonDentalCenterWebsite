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

export interface StaffReplyEmailProps {
  patientName?: string;
  chatToken?: string;
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

const listStyle: React.CSSProperties = {
  margin: '0 0 16px',
  paddingLeft: 20,
  listStyle: 'disc',
  color: '#1a1a1a',
  fontSize: 14,
  lineHeight: 1.7,
  fontFamily,
};

export const StaffReplyEmail = ({
  patientName = 'Valued Patient',
  chatToken = '',
  baseUrl = 'http://localhost:3000',
  branding,
}: StaffReplyEmailProps) => {
  const previewText = 'Our clinic team has shared an update regarding your appointment.';
  const b = branding ?? resolveEmailBranding(undefined, baseUrl);

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
            A member of our clinic staff has sent an update regarding your appointment. We are standing by to help.
          </Text>

          {/* Primary Action */}
          <Text style={pStyle}>
            If you have questions or need further assistance regarding your appointment, please don&apos;t hesitate to call or text us at{' '}
            <span style={boldStyle}>{b.phone}</span>
            {b.landline ? <> · Landline: <span style={boldStyle}>{b.landline}</span></> : ''}.
          </Text>

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
            {`Thank you for choosing ${b.clinicName}. We look forward to assisting you.`}
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

export default StaffReplyEmail;

