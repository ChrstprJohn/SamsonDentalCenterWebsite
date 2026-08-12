import React from 'react';
import { Link, Text } from '@react-email/components';
import { getLogoUrl } from '@/shared/utils/get-base-url.util';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

export interface EmailBranding {
  clinicName: string;
  logoUrl: string;
  phone: string;
  phoneHref: string;
  landline: string | null;
  contactEmail: string;
  websiteUrl: string;
  websiteLabel: string;
  whatsappUrl: string | null;
  locationLine: string;
  mapUrl: string | null;
}

const FALLBACK_CLINIC_NAME = 'Samson Dental Center';

const stripProtocol = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');

const toTelHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export function resolveEmailBranding(
  config?: Partial<ClinicConfigResponseDto> | null,
  baseUrl?: string
): EmailBranding {
  const clinicName = config?.clinicName || FALLBACK_CLINIC_NAME;
  const phone = config?.phone || '(02) 8123-4567';
  const websiteUrl = config?.websiteUrl || 'https://samsondentalcenter.com.ph';
  return {
    clinicName,
    logoUrl: config?.emailLogoUrl || getLogoUrl(baseUrl),
    phone,
    phoneHref: config?.phone ? toTelHref(config.phone) : 'tel:028123456',
    landline: config?.landline || null,
    contactEmail: config?.email || 'contact@samsondental.com',
    websiteUrl,
    websiteLabel: stripProtocol(websiteUrl),
    whatsappUrl: config?.whatsappUrl || null,
    locationLine: config?.address
      ? `${clinicName}, ${config.address}`
      : `${clinicName}, Quezon City, Metro Manila`,
    mapUrl: config?.mapUrl || null,
  };
}

const pStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: 1.75,
};

const linkStyle: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'underline',
  fontWeight: 600,
};

export function EmailSignature({ branding }: { branding: EmailBranding }) {
  return (
    <>
      <Text style={{ ...pStyle, marginBottom: '2px', fontWeight: 700 }}>{branding.clinicName}</Text>
      <Text style={{ ...pStyle, color: '#64748b', marginBottom: 0 }}>
        {branding.phone}
        {branding.landline ? ` · ${branding.landline}` : ''} &nbsp;&middot;&nbsp;{' '}
        <Link href={`mailto:${branding.contactEmail}`} style={linkStyle}>
          {branding.contactEmail}
        </Link>
        {' '}&middot;&nbsp;{' '}
        <Link href={branding.websiteUrl} target="_blank" rel="noreferrer" style={linkStyle}>
          {branding.websiteLabel}
        </Link>
        {branding.whatsappUrl && (
          <>
            {' '}&middot;&nbsp;{' '}
            <Link href={branding.whatsappUrl} target="_blank" rel="noreferrer" style={linkStyle}>
              WhatsApp
            </Link>
          </>
        )}
      </Text>
    </>
  );
}

export function EmailLegalFooter({
  branding,
  baseUrl,
  variant,
}: {
  branding: EmailBranding;
  baseUrl: string;
  variant: 'appointment' | 'inquiry';
}) {
  return (
    <Text style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
      You received this email because{' '}
      {variant === 'inquiry'
        ? `you submitted a booking inquiry with ${branding.clinicName}`
        : `you have an appointment with ${branding.clinicName}`}
      . If you believe this was sent in error, please contact our office.{' '}
      <Link href={`${baseUrl}/terms`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>
        Terms of Service
      </Link>{' '}
      &middot;{' '}
      <Link href={`${baseUrl}/privacy`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>
        Privacy Policy
      </Link>
    </Text>
  );
}