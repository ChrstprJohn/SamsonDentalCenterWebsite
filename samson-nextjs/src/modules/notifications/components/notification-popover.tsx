'use client';

import { useEffect, useRef } from 'react';
import { BellIcon } from './bell-icon';
import { NotificationItem } from './notification-item';
import { useNotificationsBell } from '../hooks/use-notifications-bell';
import { NotificationResponseDto } from '../dtos/management/notification-response.dto';
import { CheckCheck } from 'lucide-react';

interface NotificationPopoverProps {
  initialNotifications: NotificationResponseDto[];
  initialUnreadCount: number;
}

export function NotificationPopover({
  initialNotifications,
  initialUnreadCount,
}: NotificationPopoverProps) {
  const bell = useNotificationsBell({
    initialNotifications,
    initialUnreadCount,
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bell.syncWithProps(initialNotifications, initialUnreadCount);
  }, [initialNotifications, initialUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        bell.setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [bell]);

  return (
    <div className="relative" ref={popoverRef}>
      <button onClick={bell.toggleOpen} className="focus:outline-none block cursor-pointer">
        <BellIcon unreadCount={bell.unreadCount} />
      </button>

      {bell.isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-900/50">
            <span className="text-xs font-bold text-slate-200">Notifications</span>
            {bell.notifications.length > 0 && (
              <button
                onClick={bell.handleMarkAllRead}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto p-2 flex flex-col gap-1.5">
            {bell.notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <p className="text-[11px] text-slate-500 font-medium">All caught up!</p>
                <p className="text-[10px] text-slate-600 mt-0.5">No new notifications.</p>
              </div>
            ) : (
              bell.notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onMarkRead={bell.handleMarkRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
