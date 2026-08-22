export const DEFAULT_LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  'https://poaaoctucxhkhqizbsdb.supabase.co/storage/v1/object/public/public-assets/SAMSONLOGO.png';

export const DEFAULT_LOGO_DARK_URL =
  process.env.NEXT_PUBLIC_LOGO_DARK_URL ||
  process.env.NEXT_PUBLIC_LOGO_URL ||
  DEFAULT_LOGO_URL;

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return 'https://' + process.env.VERCEL_URL;
  return 'http://localhost:3000';
}

export function getLogoUrl(baseUrl?: string): string {
  if (process.env.NEXT_PUBLIC_LOGO_URL) {
    return process.env.NEXT_PUBLIC_LOGO_URL;
  }
  if (baseUrl && baseUrl.startsWith('https://') && !baseUrl.includes('localhost')) {
    return `${baseUrl.replace(/\/+$/, '')}/images/SAMSONLOGO.png`;
  }
  return DEFAULT_LOGO_URL;
}

export function getLogoDarkUrl(baseUrl?: string): string {
  if (process.env.NEXT_PUBLIC_LOGO_DARK_URL) {
    return process.env.NEXT_PUBLIC_LOGO_DARK_URL;
  }
  if (baseUrl && baseUrl.startsWith('https://') && !baseUrl.includes('localhost')) {
    return `${baseUrl.replace(/\/+$/, '')}/images/SAMSONLOGO.png`;
  }
  return DEFAULT_LOGO_DARK_URL;
}

export function getEmailLogoUrl(
  baseUrl?: string,
  variant: 'light' | 'dark' = 'light',
  config?: {
    emailLogoUrl?: string | null;
    websiteLogoUrl?: string | null;
    emailLogoDarkUrl?: string | null;
    websiteLogoDarkUrl?: string | null;
  } | null
): string {
  if (variant === 'dark') {
    const darkUrl =
      config?.emailLogoDarkUrl?.trim() ||
      config?.websiteLogoDarkUrl?.trim() ||
      process.env.NEXT_PUBLIC_LOGO_DARK_URL?.trim();
    if (darkUrl && /^https?:\/\//i.test(darkUrl)) return darkUrl;
  }

  const directUrl =
    config?.emailLogoUrl?.trim() ||
    config?.websiteLogoUrl?.trim() ||
    process.env.NEXT_PUBLIC_LOGO_URL?.trim();
  if (directUrl && /^https?:\/\//i.test(directUrl)) return directUrl;

  const base = baseUrl || getBaseUrl();
  if (base && base.startsWith('https://') && !base.includes('localhost')) {
    return `${base.replace(/\/+$/, '')}/images/SAMSONLOGO.png`;
  }

  return variant === 'dark' ? DEFAULT_LOGO_DARK_URL : DEFAULT_LOGO_URL;
}
