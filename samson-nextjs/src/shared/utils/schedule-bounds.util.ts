import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

export interface DailyScheduleBounds {
  minTime?: string;
  maxTime?: string;
  unavailableRanges: Array<{ start: string; end: string }>;
  isOpen: boolean;
}

export function formatTimeRange(timeStr?: string | null): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours)) return timeStr;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes || 0).padStart(2, '0')} ${period}`;
}

export function getDailyScheduleBounds(
  dateStr?: string | null,
  operatingHours?: ClinicConfigResponseDto['operatingHours'] | null
): DailyScheduleBounds {
  if (!dateStr || !operatingHours) {
    return { unavailableRanges: [], isOpen: true };
  }

  const weekday = new Date(`${dateStr}T00:00:00`)
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as keyof typeof operatingHours;

  const dayHours = operatingHours[weekday];
  if (!dayHours || !dayHours.isOpen || !dayHours.openTime || !dayHours.closeTime) {
    return { unavailableRanges: [], isOpen: false };
  }

  const unavailableRanges =
    dayHours.breakStartTime && dayHours.breakEndTime
      ? [{ start: dayHours.breakStartTime, end: dayHours.breakEndTime }]
      : [];

  return {
    minTime: dayHours.openTime,
    maxTime: dayHours.closeTime,
    unavailableRanges,
    isOpen: true,
  };
}
