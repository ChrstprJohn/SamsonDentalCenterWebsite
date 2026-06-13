'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '../../hooks/notifications/use-notifications';

export function NotificationsView() {
  const {
    activeTab,
    setActiveTab,
    notifications,
    unreadCount,
    toggleReadStatus,
    deleteNotification,
    markAllAsRead,
    formatDistanceToNow,
  } = useNotifications();

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary flex items-center gap-3">
            Notifications Center
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-xs text-text-muted">Keep track of your clinical appointments, reminders, and updates from Samson Dental Center.</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={markAllAsRead}
            className="shrink-0 text-xs shadow-sm"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs / Filters */}
      <div className="flex flex-col gap-6">
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
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            )}
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

        {/* Notifications List */}
        <div className="flex flex-col gap-4">
          {notifications.length > 0 ? (
            <div className="flex flex-col border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-slate-900/20 shadow-sm divide-y divide-slate-100 dark:divide-white/5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
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
                      <h4 className={`text-sm text-slate-850 dark:text-white truncate ${notif.isUnread ? 'font-bold' : 'font-medium'}`}>
                        {notif.title}
                      </h4>
                      {notif.isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                      {notif.description}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">
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
              ))}
            </div>
          ) : (
            <div className="py-20 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-center flex flex-col items-center justify-center gap-4 bg-slate-50/30 dark:bg-slate-900/10">
              <span className="text-4xl select-none">📭</span>
              <div className="flex flex-col gap-1 max-w-xs">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-350">No notifications found</p>
                <p className="text-xs text-slate-400">
                  {activeTab === 'unread' 
                    ? 'No unread notifications at this time.' 
                    : activeTab === 'read' 
                    ? 'No read notifications matches the filter.' 
                    : 'You do not have any notifications at the moment.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
