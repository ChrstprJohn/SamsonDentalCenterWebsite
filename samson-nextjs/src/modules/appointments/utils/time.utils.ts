/**
 * Combines a date string (YYYY-MM-DD) and a time string (HH:MM) into a valid PostgreSQL TIMESTAMPTZ string.
 * If the time string is already a full ISO/timestamp string (e.g. contains 'T' or 'Z'), it returns it as-is.
 */
export function formatToTimestamptz(date: string, time: string | null | undefined): string | null {
  if (!time) return null;
  if (time.includes('T') || time.includes('Z')) return time;
  // Combine date and time, assuming the clinic timezone is treated as UTC (Z)
  return `${date}T${time}:00Z`;
}
