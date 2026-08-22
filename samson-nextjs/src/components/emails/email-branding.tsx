import React from 'react';
import { Img, Link, Section, Text } from '@react-email/components';
import { DEFAULT_LOGO_URL, DEFAULT_LOGO_DARK_URL, getBaseUrl } from '@/shared/utils/get-base-url.util';
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

function resolveDirectLogoUrl(
  preferredUrl?: string | null,
  fallbackEnvUrl?: string | null,
  baseUrl?: string,
  defaultCdnUrl: string = DEFAULT_LOGO_URL
): string {
  // 1. Check direct configured URL
  const trimmed = preferredUrl?.trim();
  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // 2. Check environment variable override
  const envUrl = fallbackEnvUrl?.trim();
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl;
  }

  // 3. If relative path configured with valid public site url
  const siteBase = baseUrl || getBaseUrl();
  if (trimmed && trimmed.startsWith('/') && siteBase && siteBase.startsWith('https://') && !siteBase.includes('localhost')) {
    const cleanBase = siteBase.replace(/\/+$/, '');
    return `${cleanBase}${trimmed}`;
  }

  // 4. Default hosted public CDN storage URL
  return defaultCdnUrl;
}

export function resolveEmailBranding(
  config?: Partial<ClinicConfigResponseDto> | null,
  baseUrl?: string
): EmailBranding {
  const clinicName = config?.clinicName?.trim() || process.env.RESEND_SENDER_NAME || FALLBACK_CLINIC_NAME;
  const phone = config?.phone?.trim() || '(02) 8123-4567';
  const websiteUrl = config?.websiteUrl?.trim() || 'https://samsondentalcenter.com.ph';

  // Resolve direct public image URLs (Supabase storage or hosted public asset)
  const logoUrl = resolveDirectLogoUrl(
    config?.emailLogoUrl || config?.websiteLogoUrl,
    process.env.NEXT_PUBLIC_LOGO_URL,
    baseUrl,
    DEFAULT_LOGO_URL
  );

  const rawDarkUrl = config?.emailLogoDarkUrl || config?.websiteLogoDarkUrl || process.env.NEXT_PUBLIC_LOGO_DARK_URL;
  const logoDarkUrl = rawDarkUrl
    ? resolveDirectLogoUrl(rawDarkUrl, process.env.NEXT_PUBLIC_LOGO_DARK_URL, baseUrl, DEFAULT_LOGO_DARK_URL)
    : logoUrl;

  return {
    clinicName,
    logoUrl,
    logoDarkUrl,
    phone,
    phoneHref: config?.phone ? toTelHref(config.phone) : 'tel:028123456',
    landline: config?.landline || null,
    contactEmail: config?.email?.trim() || process.env.CLINIC_BUSINESS_EMAIL || 'info@samsondentalcenter.com',
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
  const hasDistinctDarkLogo = Boolean(
    branding.logoDarkUrl && branding.logoDarkUrl !== branding.logoUrl
  );

  if (!hasDistinctDarkLogo) {
    return (
      <Section style={{ marginBottom: '28px', textAlign: 'center' }}>
        <Img
          src={branding.logoUrl}
          alt={branding.clinicName}
          width="130"
          className="eml-logo"
          style={{ height: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }}
        />
      </Section>
    );
  }

  return (
    <Section style={{ marginBottom: '28px', textAlign: 'center' }}>
      {/* Light Mode Logo (Visible by default in light mode) */}
      <div className="light-logo" style={{ display: 'block' }}>
        <Img
          src={branding.logoUrl}
          alt={branding.clinicName}
          width="130"
          className="eml-logo light-logo"
          style={{ height: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }}
        />
      </div>
      {/* Dark Mode Logo (Hidden by default in light mode, visible on dark mode email clients) */}
      <div
        className="dark-logo"
        style={{
          display: 'none',
          maxHeight: 0,
          overflow: 'hidden',
          fontSize: 0,
          lineHeight: 0,
        }}
      >
        <Img
          src={branding.logoDarkUrl!}
          alt={branding.clinicName}
          width="130"
          className="eml-logo dark-logo"
          style={{
            height: 'auto',
            objectFit: 'contain',
            margin: '0 auto',
            display: 'none',
          }}
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