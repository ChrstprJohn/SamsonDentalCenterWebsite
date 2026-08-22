export const DEFAULT_LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  'https://poaaoctucxhkhqizbsdb.supabase.co/storage/v1/object/public/public-assets/SamsonLOGOGO-removebg-preview.png';

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
  if (baseUrl && !baseUrl.includes('localhost')) {
    return `${baseUrl}/images/SamsonLOGOGO-removebg-preview.png`;
  }
  return DEFAULT_LOGO_URL;
}

export function getLogoDarkUrl(baseUrl?: string): string {
  if (process.env.NEXT_PUBLIC_LOGO_DARK_URL) {
    return process.env.NEXT_PUBLIC_LOGO_DARK_URL;
  }
  if (baseUrl && !baseUrl.includes('localhost')) {
    return `${baseUrl}/images/SamsonLOGOGO-removebg-preview.png`;
  }
  return DEFAULT_LOGO_DARK_URL;
}