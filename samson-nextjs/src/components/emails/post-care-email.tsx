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

export interface PostCareEmailProps {
  patientName?: string;
  serviceName?: string;
  doctorName?: string;
  dateStr?: string;
  appointmentId?: string;
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

export const PostCareEmail = ({
  patientName = 'Valued Patient',
  serviceName = 'Dental Consultation & Cleaning',
  doctorName = 'Dr. Adrian Samson',
  dateStr = 'Monday, June 22, 2026',
  appointmentId = 'APT-SAMPLE',
  baseUrl = 'http://localhost:3000',
}: PostCareEmailProps) => {
  const previewText = 'Thank you for visiting Samson Dental Center. We hope your appointment went smoothly.';
  const logoUrl = `${baseUrl}/images/SamsonLOGOGO-removebg-preview.png`;
  const feedbackUrl = `${baseUrl}/feedback?ref=${appointmentId}`;

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
            Thank you for visiting Samson Dental Center. We hope your appointment went smoothly and that you are feeling great. Your experience is important to us, and we would love to hear how things went.
          </Text>

          {/* Summary Details */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
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
              <span style={boldStyle}>Location:</span> Samson Dental Center, Quezon City, Metro Manila
            </Text>
            {dateStr && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Date:</span> {dateStr}
              </Text>
            )}
            {appointmentId && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Reference ID:</span> {appointmentId}
              </Text>
            )}
          </Section>

          {/* Post care instructions */}
          <Text style={pStyle}>
            Please follow all post-treatment care instructions provided by your doctor.
          </Text>
          <Text style={pStyle}>
            If you have any concerns or questions following your visit, please do not hesitate to reach out to our clinic anytime.
          </Text>

          {/* CTA Link */}
          <Text style={pStyle}>
            If you have a moment, we would love to hear about your experience &mdash; please{' '}
            <Link href={feedbackUrl} style={linkStyle}>
              click here to share your feedback
            </Link>
            . Your feedback helps us continue to improve.
          </Text>

          <Text style={pStyle}>
            Your health and well-being are our top priority, and we greatly appreciate your trust in our care. If you have any specific concerns following your visit, please feel free to let us know.
          </Text>

          {/* Contact block */}
          <Text style={pStyle}>
            If you have any questions or would like to reschedule a future appointment, please don&apos;t hesitate to call or text us at{' '}
            <Link href="tel:028123456" style={linkStyle}>(02) 8123-4567</Link>.{' '}
            <span style={{ color: '#dc2626', fontWeight: 600 }}>Please note that replies to this email are not monitored.</span>
          </Text>

          {/* Closing */}
          <Text style={{ ...pStyle, marginBottom: '24px' }}>
            Thank you for choosing Samson Dental Center. We&apos;re dedicated to providing you with the best possible dental care experience.
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

export default PostCareEmail;
