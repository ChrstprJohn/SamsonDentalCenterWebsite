import React from 'react';

interface NotificationsEmptyStateProps {
  activeTab: 'all' | 'unread' | 'read';
}

export function NotificationsEmptyState({ activeTab }: NotificationsEmptyStateProps) {
  return (
    <div className="py-20 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-center flex flex-col items-center justify-center gap-4 bg-slate-50/30 dark:bg-slate-900/10">
      <span className="text-4xl select-none">📭</span>
      <div className="flex flex-col gap-1 max-w-xs">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-350">No notifications found</p>
        <p className="text-xs text-slate-400">
          {activeTab === 'unread'
            ? 'No unread notifications at this time.'
            : activeTab === 'read'
            ? 'No read notifications match the filter.'
            : 'You do not have any notifications at the moment.'}
        </p>
      </div>
    </div>
  );
}
