import React from 'react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  isUnread: boolean;
  description: string;
}

interface DashboardRecentNotificationsProps {
  recentNotifications: NotificationItem[];
  onViewAllClick: () => void;
}

export function DashboardRecentNotifications({
  recentNotifications,
  onViewAllClick,
}: DashboardRecentNotificationsProps) {
  return (
    <section className="lg:col-span-5 flex flex-col gap-4 text-left">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Notifications</h3>
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>
      <div className="flex flex-col gap-3.5">
        {recentNotifications.map((notif) => (
          <div
            key={notif.id}
            className="p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-sm flex items-start gap-3 hover:shadow-md transition-all duration-200"
          >
            <div className="text-lg p-2 rounded-xl bg-slate-100 dark:bg-slate-800 select-none">
              {notif.type === 'appointment' ? '📅' : '📢'}
            </div>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0 text-left">
              <div className="flex justify-between items-baseline gap-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{notif.title}</h4>
                {notif.isUnread && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {notif.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
