import React from 'react';
import { Img, Link, Section, Text } from '@react-email/components';
import { getLogoUrl, getLogoDarkUrl } from '@/shared/utils/get-base-url.util';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

export interface EmailBranding {
  clinicName: string;
  logoUrl: string;
  logoDarkUrl?: string | null;
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
  const logoUrl = config?.emailLogoUrl || getLogoUrl(baseUrl);
  const logoDarkUrl = config?.emailLogoDarkUrl || config?.websiteLogoDarkUrl || (baseUrl ? getLogoDarkUrl(baseUrl) : null);

  return {
    clinicName,
    logoUrl,
    logoDarkUrl,
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
  lineHeight: 1.7,
  fontFamily: 'Arial, Helvetica, sans-serif',
};

/**
 * Adaptive email logo component that displays the default logo in light mode
 * and automatically switches to the alternative dark mode logo on devices / clients
 * that have dark mode enabled.
 */
export function EmailLogoHeader({ branding }: { branding: EmailBranding }) {
  const darkLogo = branding.logoDarkUrl || branding.logoUrl;

  return (
    <Section style={{ marginBottom: '28px', textAlign: 'center' }}>
      {/* Light Mode Logo (Visible by default) */}
      <div className="light-logo" style={{ display: 'block' }}>
        <Img
          src={branding.logoUrl}
          alt={branding.clinicName}
          width="130"
          className="eml-logo"
          style={{ height: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }}
        />
      </div>
      {/* Dark Mode Logo (Visible on dark mode devices via media query) */}
      <div className="dark-logo" style={{ display: 'none' }}>
        <Img
          src={darkLogo}
          alt={branding.clinicName}
          width="130"
          className="eml-logo"
          style={{ height: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }}
        />
      </div>
    </Section>
  );
}

export function EmailSignature({ branding }: { branding: EmailBranding }) {
  return (
    <Text style={{ ...pStyle, marginBottom: 0, fontWeight: 700, color: '#1a1a1a' }}>
      {branding.clinicName}
    </Text>
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
    <Text style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6, margin: 0, fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {variant === 'inquiry'
        ? `You received this email because you submitted a booking inquiry with ${branding.clinicName}.`
        : `You received this email because you have an appointment with ${branding.clinicName}.`}
      {' '}
      <Link href={`${baseUrl}/terms`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>
        Terms of Service
      </Link>
      {' '}·{' '}
      <Link href={`${baseUrl}/privacy`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>
        Privacy Policy
      </Link>
    </Text>
  );
}