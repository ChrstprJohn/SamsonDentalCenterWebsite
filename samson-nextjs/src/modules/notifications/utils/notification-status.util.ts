export type NotificationStatusVariant = 'sent' | 'skipped_lead_time' | 'skipped_channel' | 'skipped_expired' | 'skipped_booking' | 'pending';

export interface NotificationStatusResult {
  label: string;
  variant: NotificationStatusVariant;
  badgeClass: string;
}

export function computeNotificationStatus({
  eventType,
  targetChannel,
  isSent,
  currentChannel,
  createdAt,
  startTime,
}: {
  eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT';
  targetChannel: 'EMAIL' | 'SMS';
  isSent: boolean;
  currentChannel: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';
  createdAt?: string | Date | null;
  startTime?: string | Date | null;
}): NotificationStatusResult {
  // 1. If actually sent (or marked sent by resend/cron), always display SENT
  if (isSent) {
    return {
      label: 'SENT',
      variant: 'sent',
      badgeClass: 'bg-green-500/10 text-green-500',
    };
  }

  const isChannelEnabled =
    currentChannel === 'BOTH' ||
    (targetChannel === 'EMAIL' && currentChannel === 'EMAIL') ||
    (targetChannel === 'SMS' && currentChannel === 'SMS');

  const nowMs = Date.now();
  let leadTimeHours: number | null = null;
  let startMs: number | null = null;

  if (createdAt && startTime) {
    const createdMs = new Date(createdAt).getTime();
    startMs = new Date(startTime).getTime();
    if (!isNaN(createdMs) && !isNaN(startMs)) {
      leadTimeHours = (startMs - createdMs) / (1000 * 3600);
    }
  } else if (startTime) {
    startMs = new Date(startTime).getTime();
  }

  const isShortLead48h = leadTimeHours !== null && leadTimeHours <= 48;
  const isShortLead24h = leadTimeHours !== null && leadTimeHours <= 24;

  // Check if reminder trigger window has already passed in time
  const isWindowPassed48h = startMs !== null && !isNaN(startMs) && nowMs > (startMs - 48 * 3600 * 1000);
  const isWindowPassed24h = startMs !== null && !isNaN(startMs) && nowMs > (startMs - 24 * 3600 * 1000);

  // 2. If target channel is currently disabled/not selected
  if (!isChannelEnabled) {
    return {
      label: 'SKIPPED (Channel Off)',
      variant: 'skipped_channel',
      badgeClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
    };
  }

  // 3. Booking confirmation is an immediate event at booking creation time
  if (eventType === 'APPOINTMENT_BOOKED') {
    return {
      label: 'SKIPPED (At Booking)',
      variant: 'skipped_booking',
      badgeClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
    };
  }

  // 4. If short lead time for reminder at booking time
  if (eventType === 'APPOINTMENT_REMINDER_48H' && isShortLead48h) {
    return {
      label: 'SKIPPED (Booked ≤48h)',
      variant: 'skipped_lead_time',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    };
  }
  if (eventType === 'APPOINTMENT_REMINDER_24H' && isShortLead24h) {
    return {
      label: 'SKIPPED (Booked ≤24h)',
      variant: 'skipped_lead_time',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    };
  }

  // 5. If reminder window has ALREADY passed and it was not sent, it was skipped (expired window)
  if (eventType === 'APPOINTMENT_REMINDER_48H' && isWindowPassed48h) {
    return {
      label: 'SKIPPED (Window Passed)',
      variant: 'skipped_expired',
      badgeClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
    };
  }
  if (eventType === 'APPOINTMENT_REMINDER_24H' && isWindowPassed24h) {
    return {
      label: 'SKIPPED (Window Passed)',
      variant: 'skipped_expired',
      badgeClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
    };
  }

  // 6. Default: Upcoming / Pending
  return {
    label: 'PENDING',
    variant: 'pending',
    badgeClass: 'bg-muted text-muted-foreground/60',
  };
}
