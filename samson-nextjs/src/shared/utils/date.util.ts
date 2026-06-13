/**
 * Formats a Date object or ISO string into a standard clinic date string.
 * Example: 'May 27, 2026'
 */
export function formatClinicDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
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
    year: 'numeric'
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
    hour12: true
  }).format(d);
}

/**
 * Calculates the end time given an ISO string and duration in minutes.
 * Returns a new Date object representing the end time, safely preserving timezone.
 */
export function calculateEndTimeFromIso(isoString: string, durationMinutes: number): Date {
  return new Date(new Date(isoString).getTime() + durationMinutes * 60000);
}
