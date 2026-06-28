/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DashboardNotification } from '../../../appointments/hooks/dashboard/use-user-dashboard-summary';
import { useNotifications } from './use-notifications';

describe('useNotifications', () => {
  it('filters unread notifications and toggles read status', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => result.current.setActiveTab('unread'));
    expect(result.current.notifications.every((item: DashboardNotification) => item.isUnread)).toBe(true);

    act(() => result.current.toggleReadStatus('n-1'));
    expect(result.current.unreadCount).toBe(1);
  });

  it('marks all as read, deletes notifications, and formats relative age', () => {
    vi.setSystemTime(new Date('2026-06-13T11:00:00Z'));
    const { result } = renderHook(() => useNotifications());

    act(() => result.current.markAllAsRead());
    expect(result.current.unreadCount).toBe(0);

    act(() => result.current.deleteNotification('n-1'));
    expect(result.current.notifications.some((item: DashboardNotification) => item.id === 'n-1')).toBe(false);
    expect(result.current.formatDistanceToNow('2026-06-13T10:00:00Z')).toBe('1h ago');
    vi.useRealTimers();
  });
});
