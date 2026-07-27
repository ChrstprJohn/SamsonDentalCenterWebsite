import { describe, expect, it, vi } from 'vitest';
import { computeNotificationStatus } from './notification-status.util';

describe('computeNotificationStatus', () => {
  it('marks a 48-hour reminder skipped when booked inside the 48-hour lead window', () => {
    const status = computeNotificationStatus({
      eventType: 'APPOINTMENT_REMINDER_48H',
      targetChannel: 'EMAIL',
      isSent: false,
      currentChannel: 'BOTH',
      createdAt: '2026-07-27T08:00:00Z',
      startTime: '2026-07-28T07:00:00Z',
    });

    expect(status.label).toBe('SKIPPED (Booked <48h)');
    expect(status.variant).toBe('skipped_lead_time');
  });

  it('marks a 24-hour reminder skipped when booked inside the 24-hour lead window', () => {
    const status = computeNotificationStatus({
      eventType: 'APPOINTMENT_REMINDER_24H',
      targetChannel: 'SMS',
      isSent: false,
      currentChannel: 'BOTH',
      createdAt: '2026-07-27T08:00:00Z',
      startTime: '2026-07-28T07:00:00Z',
    });

    expect(status.label).toBe('SKIPPED (Booked <24h)');
    expect(status.variant).toBe('skipped_lead_time');
  });

  it('uses booked lead time even when a same-day start timestamp is earlier than createdAt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-27T08:00:00Z'));

    const status = computeNotificationStatus({
      eventType: 'APPOINTMENT_REMINDER_24H',
      targetChannel: 'SMS',
      isSent: false,
      currentChannel: 'BOTH',
      createdAt: '2026-07-27T08:00:00Z',
      startTime: '2026-07-27T07:00:00Z',
    });

    expect(status.label).toBe('SKIPPED (Booked <24h)');
    expect(status.variant).toBe('skipped_lead_time');

    vi.useRealTimers();
  });
});
