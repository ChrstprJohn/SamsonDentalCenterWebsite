'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, CircleAlert, ExternalLink, MailWarning, MessageSquare, RefreshCw, Search } from 'lucide-react';
import { NotificationResponseDto } from '../dtos/management/notification-response.dto';
import { markAllReadAction } from '../actions/management/mark-all-read.action';
import { markReadAction } from '../actions/management/mark-read.action';
import { useToast } from '@/components/feedback/toast-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NotificationsListViewProps {
  initialNotifications: NotificationResponseDto[];
}

const TABS = ['ALL', 'UNREAD', 'READ'] as const;
type TabType = (typeof TABS)[number];

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_INQUIRY':
      return <Bell className="size-4 text-emerald-600" />;
    case 'NEW_MESSAGE':
      return <MessageSquare className="size-4 text-sky-600" />;
    case 'FAILED_EMAIL_ALERT':
      return <MailWarning className="size-4 text-amber-600" />;
    default:
      return <CircleAlert className="size-4 text-primary" />;
  }
}

function formatRelativeTime(dateString: string) {
  const diffMins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}

export function NotificationsListView({ initialNotifications }: NotificationsListViewProps) {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(initialNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const isV2 = pathname?.startsWith('/secretary-v2');

  useEffect(() => setNotifications(initialNotifications), [initialNotifications]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const filteredNotifications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return notifications.filter((notification) => {
      const matchesSearch = !query || [notification.title, notification.message, notification.type]
        .some((value) => value.toLowerCase().includes(query));
      const matchesStatus = activeTab === 'ALL'
        || (activeTab === 'UNREAD' && !notification.isRead)
        || (activeTab === 'READ' && notification.isRead);
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, notifications, searchTerm]);

  const getTargetUrl = (url: string) => (
    isV2 && url.startsWith('/secretary') && !url.startsWith('/secretary-v2')
      ? url.replace(/^\/secretary(\/|$)/, '/secretary-v2$1')
      : url
  );

  const selectedNotification = useMemo(
    () => notifications.find((notification) => notification.id === selectedId) ?? null,
    [notifications, selectedId]
  );

  const handleMarkRead = async (id: string) => {
    const notification = notifications.find((item) => item.id === id);
    if (!notification || notification.isRead) return;
    setUpdatingId(id);
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
    const result = await markReadAction({ id });
    if (!result.success) {
      addToast(result.error || 'Failed to mark notification as read.', 'error');
      router.refresh();
    }
    setUpdatingId(null);
  };

  const handleMarkAllRead = async () => {
    if (!unreadCount) return;
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    const result = await markAllReadAction();
    if (result.success) addToast('All notifications marked as read.', 'success');
    else {
      addToast(result.error || 'Failed to mark all notifications as read.', 'error');
      router.refresh();
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    void handleMarkRead(id);
  };

  return (
    <div className={`flex h-full min-h-0 w-full flex-1 overflow-hidden ${selectedNotification ? 'flex-row gap-0' : 'flex-col gap-6 p-6 md:p-8'}`}>
      <div className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden ${selectedNotification ? 'flex-1 border-r border-card-border/40 bg-sidebar' : 'w-full gap-6'}`}>
      <div className={`flex flex-col gap-4 shrink-0 ${selectedNotification ? 'border-b border-card-border/40 p-4' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-text-primary md:text-3xl">Notifications</h1>
              {unreadCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{unreadCount} new</span>}
            </div>
            <p className="mt-1 text-xs text-text-muted">Clinic alerts, inquiries, and communication updates.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.refresh()} className="h-9 gap-1.5 text-xs" title="Refresh notifications">
              <RefreshCw className="size-3.5" /> Refresh
            </Button>
            <Button size="sm" onClick={() => void handleMarkAllRead()} disabled={!unreadCount} className="h-9 gap-1.5 text-xs">
              <CheckCheck className="size-3.5" /> Mark all read
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search notifications..." className="h-9 bg-card pl-9 text-sm" />
          </div>
          <div className="relative grid w-full grid-cols-3 rounded-xl border border-card-border/60 bg-muted/20 p-1 sm:w-72">
            {TABS.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`h-8 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{tab.charAt(0) + tab.slice(1).toLowerCase()}</button>)}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border" data-lenis-prevent style={{ scrollbarWidth: 'thin' }}>
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted/30"><Bell className="size-5 text-muted-foreground/60" /></div>
            <p className="text-sm font-medium text-foreground">No notifications found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting the search or status filter.</p>
          </div>
        ) : (
          <div>
            <div className="hidden border-b border-card-border/50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-text-muted md:block">
              Notification
            </div>
            <div>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(notification.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleSelect(notification.id);
                    }
                  }}
                  className={`grid cursor-pointer gap-3 border-b border-card-border/40 px-4 py-3.5 last:border-b-0 transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-4 ${selectedId === notification.id ? 'bg-muted/40' : !notification.isRead ? 'bg-primary/[0.025]' : ''}`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/30">{getNotificationIcon(notification.type)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><p className={`truncate text-sm ${notification.isRead ? 'font-medium text-foreground' : 'font-bold text-foreground'}`}>{notification.title}</p>{!notification.isRead && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}</div>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                  <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${notification.isRead ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400'}`}>{notification.isRead ? 'READ' : 'UNREAD'}</span>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className="text-xs text-muted-foreground md:text-right" suppressHydrationWarning>{formatRelativeTime(notification.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      {!notification.isRead && <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); void handleMarkRead(notification.id); }} disabled={updatingId === notification.id} className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"><Check className="size-3.5" /> Read</Button>}
                      {notification.linkUrl && <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" title="Open linked item"><Link href={getTargetUrl(notification.linkUrl)} onClick={(event) => { event.stopPropagation(); void handleMarkRead(notification.id); }}><ExternalLink className="size-3.5" /><span className="sr-only">Open linked item</span></Link></Button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

        {selectedNotification && (
        <aside className="flex h-full min-h-0 w-[min(520px,45%)] shrink-0 flex-col rounded-xl border border-card-border/60">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-card-border/40 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="-ml-1 size-8 shrink-0 p-0 text-muted-foreground hover:text-foreground" title="Back to notifications">
                  <span className="text-lg leading-none">&larr;</span><span className="sr-only">Back to notifications</span>
                </Button>
              </div>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/30">{getNotificationIcon(selectedNotification.type)}</div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border" data-lenis-prevent style={{ scrollbarWidth: 'thin' }}>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Notification</p>
                <h2 className="mt-1 text-base font-bold leading-snug text-foreground">{selectedNotification.title}</h2>
              </div>
              <div className="border-y border-card-border/50 py-3 text-xs text-muted-foreground">
                Received <span className="font-medium text-foreground" suppressHydrationWarning>{new Date(selectedNotification.createdAt).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{selectedNotification.message}</p>
              {selectedNotification.linkUrl && <Button asChild className="w-full gap-2 text-sm"><Link href={getTargetUrl(selectedNotification.linkUrl)}><ExternalLink className="size-4" /> Open linked item</Link></Button>}
            </div>
        </aside>
        )}
      </div>
  );
}
