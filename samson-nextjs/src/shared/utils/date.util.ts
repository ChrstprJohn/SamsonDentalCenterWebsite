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
 * Formats a naive appointment date ('YYYY-MM-DD') relative to today.
 * Returns 'Today', 'Tomorrow', 'in 3d' (≤30 days out), or '' when far.
 */
export function formatRelativeDay(date: string): string {
  if (!date) return '';
  const today = new Date(getTodayLocalDateStr() + 'T00:00:00Z');
  const target = new Date(date + 'T00:00:00Z');
  if (isNaN(target.getTime())) return '';
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 30) return `in ${diffDays}d`;
  return '';
}

/**
 * Formats a Date object or ISO string into a standard time string.
 * Also handles bare "HH:MM" or "HH:MM:SS" naive local strings (no timezone).
 * Example: '2:30 PM'
 */
export function formatClinicTime(date: Date | string | null): string {
  if (!date) return '';

  if (typeof date === 'string') {
    if (date.includes('AM') || date.includes('PM')) {
      return date;
    }
    let timeStr = date;
    if (date.includes('T')) {
      timeStr = date.split('T')[1].split('.')[0].replace('Z', '').split('+')[0];
    }
    // Fast-path: bare HH:MM or HH:MM:SS naive local time — route through formatTimeString
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
      return formatTimeString(timeStr);
    }
  }

  const d = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(d.getTime())) {
    if (typeof date === 'string' && date.toLowerCase().includes('invalid')) {
      return '';
    }
    return typeof date === 'string' ? date : '';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila'
  }).format(d);
}

/**
 * Formats a naive 24h time string (e.g. '08:00' or '17:00:00') into a standard AM/PM time string.
 * Example: '17:00' -> '5:00 PM'
 */
export function formatTimeString(timeStr: string): string {
  if (!timeStr) return '';
  if (timeStr === 'MORNING') return 'Morning (09:00 AM - 12:00 PM)';
  if (timeStr === 'AFTERNOON') return 'Afternoon (01:00 PM - 05:00 PM)';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;

  const timePart = timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr;
  const parts = timePart.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m)) {
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const mStr = String(m).padStart(2, '0');
      return `${h12}:${mStr} ${period}`;
    }
  }
  return timeStr;
}

/**
 * Calculates the end time given an ISO string and duration in minutes.
 * Returns a new Date object representing the end time, safely preserving timezone.
 * @deprecated Use calculateEndTime for HH:MM naive local time strings.
 */
export function calculateEndTimeFromIso(isoString: string, durationMinutes: number): Date {
  return new Date(new Date(isoString).getTime() + durationMinutes * 60000);
}

/**
 * Calculates the end time given a naive HH:MM start time and duration in minutes.
 * Returns the end time as an HH:MM string.
 * Example: calculateEndTime('09:00', 25) -> '09:25'
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  if (!startTime) return '';
  if (typeof startTime === 'string' && (startTime.includes('T') || (startTime.includes('-') && startTime.includes(':')))) {
    const d = new Date(startTime);
    if (!isNaN(d.getTime())) {
      return new Date(d.getTime() + (durationMinutes || 0) * 60000).toISOString();
    }
  }
  const timePart = startTime.includes(' ') ? startTime.split(' ')[1] : startTime;
  const [hStr, mStr] = timePart.split(':');
  const hNum = parseInt(hStr, 10);
  const mNum = parseInt(mStr, 10);
  if (isNaN(hNum) || isNaN(mNum)) return startTime;
  const totalMinutes = hNum * 60 + mNum + (durationMinutes || 0);
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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

/**
 * Formats an appointment or inquiry ID into a short unique reference string.
 * Example: 'd9b7f54c-1111-4444-9999-555555555555' -> 'D9B7F54C'
 */
export function formatRefId(id?: string): string {
  if (!id) return '';
  const clean = id.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts[0].length >= 4) {
      return parts[0].toUpperCase();
    }
    return parts.slice(0, 2).join('-').toUpperCase();
  }
  return clean.slice(0, 8).toUpperCase();
}

