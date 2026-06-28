'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '../../hooks/notifications/use-notifications';
import { NotificationsTabs } from './sub-components/notifications-tabs';
import { NotificationItemCard } from './sub-components/notification-item-card';
import { NotificationsEmptyState } from './sub-components/notifications-empty-state';

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
    <div className="flex flex-col gap-8 text-left">
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
          <p className="text-xs text-text-muted">
            Keep track of your clinical appointments, reminders, and updates from Samson Dental Center.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead} className="shrink-0 text-xs shadow-sm">
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs / Filters */}
      <div className="flex flex-col gap-6">
        <NotificationsTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
        />

        {/* Notifications List */}
        <div className="flex flex-col gap-4">
          {notifications.length > 0 ? (
            <div className="flex flex-col border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-slate-900/20 shadow-sm divide-y divide-slate-100 dark:divide-white/5">
              {notifications.map((notif) => (
                <NotificationItemCard
                  key={notif.id}
                  notif={notif}
                  toggleReadStatus={toggleReadStatus}
                  deleteNotification={deleteNotification}
                  formatDistanceToNow={formatDistanceToNow}
                />
              ))}
            </div>
          ) : (
            <NotificationsEmptyState activeTab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}
