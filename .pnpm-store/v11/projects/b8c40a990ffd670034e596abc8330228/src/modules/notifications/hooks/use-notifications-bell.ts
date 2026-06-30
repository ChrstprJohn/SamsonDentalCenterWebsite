'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationResponseDto } from '../dtos/management/notification-response.dto';
import { markReadAction } from '../actions/management/mark-read.action';
import { markAllReadAction } from '../actions/management/mark-all-read.action';
import { useToast } from '@/components/feedback/toast-container';

interface UseNotificationsBellProps {
  initialNotifications: NotificationResponseDto[];
  initialUnreadCount: number;
}

export function useNotificationsBell({
  initialNotifications,
  initialUnreadCount,
}: UseNotificationsBellProps) {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { addToast } = useToast();
  const router = useRouter();

  const syncWithProps = (nextNotifs: NotificationResponseDto[], nextCount: number) => {
    setNotifications(nextNotifs);
    setUnreadCount(nextCount);
  };

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    const result = await markReadAction({ id });
    if (!result.success) {
      addToast(result.error || 'Failed to mark read', 'error');
      router.refresh();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    const result = await markAllReadAction();
    if (!result.success) {
      addToast(result.error || 'Failed to mark all read', 'error');
      router.refresh();
    }
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    setIsOpen,
    handleMarkRead,
    handleMarkAllRead,
    syncWithProps,
  };
}
