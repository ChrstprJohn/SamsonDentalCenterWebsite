import React from 'react';

export interface NotificationData {
  id: string;
  isUnread: boolean;
  type: string;
  title: string;
  description: string;
  createdAt: string | Date;
}

interface NotificationItemCardProps {
  notif: NotificationData;
  toggleReadStatus: (id: string) => void;
  deleteNotification: (id: string) => void;
  formatDistanceToNow: (date: any) => string;
}

export function NotificationItemCard({
  notif,
  toggleReadStatus,
  deleteNotification,
  formatDistanceToNow,
}: NotificationItemCardProps) {
  return (
    <div
      className={`p-5 flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors duration-150 relative group ${
        notif.isUnread ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''
      }`}
    >
      {/* Icon */}
      <div className="text-xl p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0 select-none">
        {notif.type === 'appointment' ? '📅' : '📢'}
      </div>

      {/* Body Content */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={`text-sm text-slate-850 dark:text-white truncate ${
              notif.isUnread ? 'font-bold' : 'font-medium'
            }`}
          >
            {notif.title}
          </h4>
          {notif.isUnread && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Unread" />
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl text-left">
          {notif.description}
        </p>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 text-left">
          {formatDistanceToNow(notif.createdAt)}
        </span>
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
        <button
          onClick={() => toggleReadStatus(notif.id)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer"
          title={notif.isUnread ? 'Mark as Read' : 'Mark as Unread'}
        >
          {notif.isUnread ? '✓' : '✉'}
        </button>
        <button
          onClick={() => deleteNotification(notif.id)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-150 cursor-pointer"
          title="Delete Notification"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
