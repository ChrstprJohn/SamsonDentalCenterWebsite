import React from 'react';

interface NotificationsTabsProps {
  activeTab: 'all' | 'unread' | 'read';
  setActiveTab: (tab: 'all' | 'unread' | 'read') => void;
  unreadCount: number;
}

export function NotificationsTabs({
  activeTab,
  setActiveTab,
  unreadCount,
}: NotificationsTabsProps) {
  return (
    <div className="flex border-b border-slate-200 dark:border-white/10 gap-6">
      <button
        onClick={() => setActiveTab('all')}
        className={`py-3.5 px-1 relative text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
          activeTab === 'all'
            ? 'text-slate-900 dark:text-white font-bold'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        All
        {activeTab === 'all' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
        )}
      </button>

      <button
        onClick={() => setActiveTab('unread')}
        className={`py-3.5 px-1 relative text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
          activeTab === 'unread'
            ? 'text-slate-900 dark:text-white font-bold'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        Unread
        {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
        {activeTab === 'unread' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
        )}
      </button>

      <button
        onClick={() => setActiveTab('read')}
        className={`py-3.5 px-1 relative text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
          activeTab === 'read'
            ? 'text-slate-900 dark:text-white font-bold'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        Read
        {activeTab === 'read' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
        )}
      </button>
    </div>
  );
}
