import { describe, expect, it, vi } from 'vitest';
import { computeNotificationStatus } from './notification-status.util';

describe('computeNotificationStatus', () => {
  it('returns SENT when isSent is true even if booked <48h', () => {
    const status = computeNotificationStatus({
      eventType: 'APPOINTMENT_REMINDER_48H',
      targetChannel: 'EMAIL',
      isSent: true,
      currentChannel: 'BOTH',
      createdAt: '2026-07-27T08:00:00Z',
      startTime: '2026-07-28T07:00:00Z',
    });

    expect(status.label).toBe('SENT');
    expect(status.variant).toBe('sent');
  });

  it('marks a 48-hour reminder skipped when booked inside the 48-hour lead window and not sent', () => {
    const status = computeNotificationStatus({
      eventType: 'APPOINTMENT_REMINDER_48H',
      targetChannel: 'EMAIL',
      isSent: false,
      currentChannel: 'BOTH',
      createdAt: '2026-07-27T08:00:00Z',
      startTime: '2026-07-28T07:00:00Z',
    });

    expect(status.label).toBe('SKIPPED (Booked ≤48h)');
    expect(status.variant).toBe('skipped_lead_time');
  });

  it('marks a 24-hour reminder skipped when booked inside the 24-hour lead window and not sent', () => {
    const status = computeNotificationStatus({
      eventType: 'APPOINTMENT_REMINDER_24H',
      targetChannel: 'SMS',
      isSent: false,
      currentChannel: 'BOTH',
      createdAt: '2026-07-27T08:00:00Z',
      startTime: '2026-07-28T07:00:00Z',
    });

    expect(status.label).toBe('SKIPPED (Booked ≤24h)');
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

    expect(status.label).toBe('SKIPPED (Booked ≤24h)');
    expect(status.variant).toBe('skipped_lead_time');

    vi.useRealTimers();
  });

  it('computes PENDING for a rescheduled appointment far in the future', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-10T10:00:00Z'));

    const status48h = computeNotificationStatus({
      eventType: 'APPOINTMENT_REMINDER_48H',
      targetChannel: 'EMAIL',
      isSent: false,
      currentChannel: 'BOTH',
      createdAt: '2026-08-10T10:00:00Z', // Rescheduled today
      startTime: '2026-08-20T09:00:00Z', // 10 days in future
    });

    expect(status48h.label).toBe('PENDING');
    expect(status48h.variant).toBe('pending');

    const status24h = computeNotificationStatus({
      eventType: 'APPOINTMENT_REMINDER_24H',
      targetChannel: 'EMAIL',
      isSent: false,
      currentChannel: 'BOTH',
      createdAt: '2026-08-10T10:00:00Z',
      startTime: '2026-08-20T09:00:00Z',
    });

    expect(status24h.label).toBe('PENDING');
    expect(status24h.variant).toBe('pending');

    vi.useRealTimers();
  });
});
