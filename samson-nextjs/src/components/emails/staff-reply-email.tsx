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

export interface StaffReplyEmailProps {
  patientName?: string;
  chatToken?: string;
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

export const StaffReplyEmail = ({
  patientName = 'Valued Patient',
  chatToken = '',
  baseUrl = 'http://localhost:3000',
}: StaffReplyEmailProps) => {
  const previewText = 'A member of our clinic team has sent you a message. Click to view and reply.';
  const logoUrl = `${baseUrl}/images/SamsonLOGOGO-removebg-preview.png`;
  const chatUrl = `${baseUrl}/manage?token=${chatToken}&openChat=true`;

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
            A member of our clinic staff has sent you a reply regarding your appointment or inquiry. We are standing by to help.
          </Text>

          {/* Action Link */}
          <Text style={pStyle}>
            Please{' '}
            <Link href={chatUrl} style={linkStyle}>click here to open your clinic chat</Link>{' '}
            to view the message and continue the conversation.
          </Text>

          {/* Contact block */}
          <Text style={pStyle}>
            If you have any questions or need further assistance, please don&apos;t hesitate to reach out. You can{' '}
            <Link href={chatUrl} style={linkStyle}>click here to open the clinic chat</Link>{' '}
            or call or text us at <Link href="tel:028123456" style={linkStyle}>(02) 8123-4567</Link>.{' '}
            <span style={{ color: '#dc2626', fontWeight: 600 }}>Please note that replies to this email are not monitored.</span>
          </Text>

          {/* Closing */}
          <Text style={{ ...pStyle, marginBottom: '24px' }}>
            Thank you for choosing Samson Dental Center. We look forward to assisting you.
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
            You received this email because you have an appointment with Samson Dental Center. If you believe this was sent in error, please contact our office.{' '}
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

export default StaffReplyEmail;
