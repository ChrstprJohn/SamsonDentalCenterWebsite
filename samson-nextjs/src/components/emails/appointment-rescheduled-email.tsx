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

export interface AppointmentRescheduledEmailProps {
  patientName?: string;
  serviceName?: string;
  doctorName?: string;
  oldDateStr?: string;
  oldTimeRangeStr?: string;
  dateStr?: string;
  timeRangeStr?: string;
  appointmentId?: string;
  rescheduleReason?: string;
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

export const AppointmentRescheduledEmail = ({
  patientName = 'Valued Patient',
  serviceName = 'Dental Consultation & Cleaning',
  doctorName = 'Dr. Adrian Samson',
  oldDateStr = '',
  oldTimeRangeStr = '',
  dateStr = 'Monday, June 22, 2026',
  timeRangeStr = '2:00 PM – 2:45 PM',
  appointmentId = 'APT-SAMPLE',
  rescheduleReason = '',
  chatToken = '',
  baseUrl = 'http://localhost:3000',
}: AppointmentRescheduledEmailProps) => {
  const previewText = 'Please review your updated clinic date, time, and location.';
  const logoUrl = getLogoUrl(baseUrl);
  const chatUrl = `${baseUrl}/manage?token=${chatToken || appointmentId}&openChat=true`;

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
            Your appointment at Samson Dental Center has been rescheduled. Please see your new visit details below.
          </Text>

          {/* Details list */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            {(oldDateStr || oldTimeRangeStr) && (
              <Text style={{ ...pStyle, margin: '0 0 8px' }}>
                <span style={boldStyle}>Previously scheduled:</span>{' '}
                <span style={{ color: '#64748b', textDecoration: 'line-through' }}>
                  {oldDateStr && oldTimeRangeStr
                    ? `${oldDateStr} (${oldTimeRangeStr})`
                    : oldDateStr || oldTimeRangeStr}
                </span>
              </Text>
            )}
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>
              Your new appointment details:
            </Text>
            <Text style={{ ...pStyle, margin: '0 0 4px' }}>
              <span style={boldStyle}>Status:</span>{' '}
              <span style={{ fontWeight: 700, color: '#2563eb' }}>Confirmed / Approved</span>
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
            {timeRangeStr && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Time:</span> {timeRangeStr}
              </Text>
            )}
            {appointmentId && (
              <Text style={{ ...pStyle, margin: '0 0 4px' }}>
                <span style={boldStyle}>Reference ID:</span> {formatRefId(appointmentId)}
              </Text>
            )}
          </Section>

          {rescheduleReason && (
            <Text style={pStyle}>
              Reschedule reason: <span style={boldStyle}>{rescheduleReason}</span>
            </Text>
          )}

          {/* Quick Reminders checklist */}
          <Section style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <Text style={{ ...pStyle, margin: '0 0 8px', fontWeight: 700 }}>Quick Reminders</Text>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: '14px', lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>Please arrive 10-15 minutes early so we can get you checked in smoothly.</li>
              <li style={{ marginBottom: 6 }}>
                Have questions or need to reschedule?{' '}
                <Link href={chatUrl} style={linkStyle}>Click here to open clinic chat</Link>, or call/text us at{' '}
                <Link href="tel:028123456" style={linkStyle}>(02) 8123-4567</Link>.
              </li>
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </Section>

          {/* Closing */}
          <Text style={{ ...pStyle, marginBottom: '24px' }}>
            Thank you for choosing Samson Dental Center. See you soon!
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

export default AppointmentRescheduledEmail;
