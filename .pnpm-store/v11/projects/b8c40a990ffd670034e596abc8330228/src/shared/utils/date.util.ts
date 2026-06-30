/**
 * Formats a Date object or ISO string into a standard clinic date string.
 * Example: 'May 27, 2026'
 */
export function formatClinicDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(d);
}

/**
 * Formats a Date object or ISO string into a short standard string.
 * Example: 'Dec 1, 2026'
 */
export function formatShortDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  // If date parsing fails, return original string (e.g., 'N/A')
  if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(d);
}

/**
 * Formats a Date object or ISO string into a standard time string.
 * Example: '2:30 PM'
 */
export function formatClinicTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  }).format(d);
}

/**
 * Formats a naive 24h time string (e.g. '08:00' or '17:00:00') into a standard AM/PM time string.
 * Example: '17:00' -> '5:00 PM'
 */
export function formatTimeString(timeStr: string): string {
  if (!timeStr) return '';
  const cleanTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  return formatClinicTime(`2000-01-01T${cleanTime}Z`);
}

/**
 * Calculates the end time given an ISO string and duration in minutes.
 * Returns a new Date object representing the end time, safely preserving timezone.
 */
export function calculateEndTimeFromIso(isoString: string, durationMinutes: number): Date {
  return new Date(new Date(isoString).getTime() + durationMinutes * 60000);
}

/**
 * Returns today's date as a YYYY-MM-DD string in the BROWSER'S LOCAL timezone.
 * Use this instead of new Date().toISOString().split('T')[0] which gives the UTC date
 * and can be a day behind for UTC+8 users between midnight and 08:00 local time.
 */
export function getTodayLocalDateStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns the current date/time shifted to the clinic's naive-UTC space.
 * Assuming clinic is in Asia/Manila (UTC+8).
 */
export function getClinicNaiveDate(d: Date = new Date()): Date {
  const clinicOffsetMinutes = -480; // UTC+8
  return new Date(d.getTime() - clinicOffsetMinutes * 60 * 1000);
}

