// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotificationsBell } from './use-notifications-bell';
import { markReadAction } from '../actions/management/mark-read.action';
import { markAllReadAction } from '../actions/management/mark-all-read.action';

vi.mock('../actions/management/mark-read.action', () => ({
  markReadAction: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock('../actions/management/mark-all-read.action', () => ({
  markAllReadAction: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe('useNotificationsBell Hook', () => {
  const mockNotifications = [
    {
      id: '1',
      recipientRole: 'SECRETARY',
      recipientId: null,
      type: 'TREATMENT_RENDERED',
      priority: 'HIGH' as const,
      title: 'Ready for Checkout',
      message: 'Treatment done',
      linkUrl: '/checkout',
      entityId: '123',
      isRead: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
    },
  ];

  it('initializes and toggles state correctly', () => {
    const { result } = renderHook(() =>
      useNotificationsBell({
        initialNotifications: mockNotifications,
        initialUnreadCount: 1,
      })
    );

    expect(result.current.unreadCount).toBe(1);
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggleOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('marks a notification read optimistically', async () => {
    const { result } = renderHook(() =>
      useNotificationsBell({
        initialNotifications: mockNotifications,
        initialUnreadCount: 1,
      })
    );

    await act(async () => {
      await result.current.handleMarkRead('1');
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].isRead).toBe(true);
    expect(markReadAction).toHaveBeenCalledWith({ id: '1' });
  });

  it('marks all read optimistically', async () => {
    const { result } = renderHook(() =>
      useNotificationsBell({
        initialNotifications: mockNotifications,
        initialUnreadCount: 1,
      })
    );

    await act(async () => {
      await result.current.handleMarkAllRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].isRead).toBe(true);
    expect(markAllReadAction).toHaveBeenCalled();
  });
});
