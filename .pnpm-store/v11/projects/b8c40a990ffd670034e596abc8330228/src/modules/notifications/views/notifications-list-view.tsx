'use client';

import { useState } from 'react';
import { NotificationResponseDto } from '../dtos/management/notification-response.dto';
import { NotificationItem } from '../components/notification-item';
import { markAllReadAction } from '../actions/management/mark-all-read.action';
import { markReadAction } from '../actions/management/mark-read.action';
import { useToast } from '@/components/feedback/toast-container';
import { useRouter } from 'next/navigation';
import { CheckCheck } from 'lucide-react';

interface NotificationsListViewProps {
  initialNotifications: NotificationResponseDto[];
}

export function NotificationsListView({ initialNotifications }: NotificationsListViewProps) {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(initialNotifications);
  const { addToast } = useToast();
  const router = useRouter();

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    const result = await markReadAction({ id });
    if (!result.success) {
      addToast(result.error || 'Failed to mark read', 'error');
      router.refresh();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const result = await markAllReadAction();
    if (!result.success) {
      addToast(result.error || 'Failed to mark all read', 'error');
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {notifications.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800/60 rounded-2xl text-center">
            <span className="text-3xl mb-2">🎉</span>
            <h3 className="text-sm font-bold text-slate-200">All caught up!</h3>
            <p className="text-xs text-slate-500 mt-1">You have no unread notifications.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={handleMarkRead}
            />
          ))
        )}
      </div>
    </div>
  );
}
