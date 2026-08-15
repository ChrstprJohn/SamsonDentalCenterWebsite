'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, CircleAlert, ExternalLink, MailWarning, MessageSquare, RefreshCw, Search, Star, CalendarX } from 'lucide-react';
import { NotificationResponseDto } from '../dtos/management/notification-response.dto';
import { markAllReadAction } from '../actions/management/mark-all-read.action';
import { markReadAction } from '../actions/management/mark-read.action';
import { getNotificationsPageAction } from '../actions/management/list-notifications-page.action';
import { useToast } from '@/components/feedback/toast-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SecretaryListSkeleton, SecretaryListSkeletonTheme } from '@/modules/staff/views/secretary/sub-components/secretary-list-skeleton';
import type { PageResult } from '@/shared/pagination/page-result';

interface NotificationsListViewProps {
  initialPage: PageResult<NotificationResponseDto>;
  initialUnreadCount: number;
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
    case 'REVIEW_SUBMITTED':
      return <Star className="size-4 text-violet-600" />;
    case 'NO_SHOW_REASON_SUBMITTED':
      return <CalendarX className="size-4 text-red-600" />;
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

export function NotificationsListView({ initialPage, initialUnreadCount }: NotificationsListViewProps) {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(initialPage.items);
  const [total, setTotal] = useState(initialPage.total);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INQUIRY' | 'EMAIL' | 'CHAT'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [prevPageCount, setPrevPageCount] = useState(0);
  const { addToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const isV2 = pathname?.startsWith('/secretary-v2');

  const nextCursorRef = useRef<string | null>(initialPage.nextCursor);
  const prevCursorsRef = useRef<string[]>([]);
  const requestId = useRef(0);

  const PAGE_SIZE = 25;

  // Sync on server refresh (realtime INSERT triggers router.refresh in the layout's RealtimeListener).
  useEffect(() => {
    setNotifications(initialPage.items);
    setTotal(initialPage.total);
    setHasMore(initialPage.hasMore);
    setUnreadCount(initialUnreadCount);
  }, [initialPage, initialUnreadCount]);

  const fetchNotifications = useCallback(async (mode: 'reset' | 'next' | 'prev') => {
    const id = ++requestId.current;
    if (mode === 'reset') setNotifications([]); // show skeleton instead of stale rows
    setLoading(true);
    setError(null);

    let cursor: string | null = null;
    let restoredCursor: string | null = null;
    if (mode === 'next') cursor = nextCursorRef.current;
    if (mode === 'prev') {
      restoredCursor = prevCursorsRef.current.pop() ?? null;
      cursor = prevCursorsRef.current[prevCursorsRef.current.length - 1] ?? null;
    }

    try {
      const res = await getNotificationsPageAction({
        limit: PAGE_SIZE,
        cursor: cursor ?? undefined,
        status: activeTab === 'ALL' ? undefined : activeTab,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        search: searchTerm.trim() || undefined,
      });
      if (id !== requestId.current) return;
      if (!res.success || !res.data) throw new Error(res.error || 'Could not load notifications.');

      setNotifications(res.data.items);
      setTotal(res.data.total);
      nextCursorRef.current = mode === 'prev' ? restoredCursor : res.data.nextCursor;
      setHasMore(res.data.hasMore);
      prevCursorsRef.current =
        mode === 'reset' ? [] : mode === 'next' ? [...prevCursorsRef.current, cursor].filter((c): c is string => Boolean(c)) : prevCursorsRef.current;
      setPrevPageCount(prevCursorsRef.current.length);
    } catch (cause) {
      if (id === requestId.current) setError(cause instanceof Error ? cause.message : 'Could not load notifications.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [activeTab, searchTerm, typeFilter]);

  // Debounced refetch on filter/search/status change — same as Delivery Logs.
  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchNotifications('reset'); }, 250);
    return () => window.clearTimeout(timer);
  }, [fetchNotifications]);

  const getTargetUrl = (url: string) => {
    if (isV2) {
      if (url.startsWith('/secretary/emails')) return url.replace(/^\/secretary\/emails/, '/secretary-v2/delivery-logs');
      if (url.startsWith('/secretary/inquiries')) return url.replace(/^\/secretary\/inquiries/, '/secretary-v2/pending');
      if (url.startsWith('/secretary') && !url.startsWith('/secretary-v2')) return url.replace(/^\/secretary(\/|$)/, '/secretary-v2$1');
    }
    return url;
  };

  const handleMarkRead = async (id: string) => {
    const notification = notifications.find((item) => item.id === id);
    if (!notification || notification.isRead) return;
    setUpdatingId(id);
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
    setUnreadCount((count) => Math.max(0, count - 1));
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
    if (result.success) {
      setUnreadCount(0);
      addToast('All notifications marked as read.', 'success');
      void fetchNotifications('reset');
    } else {
      addToast(result.error || 'Failed to mark all notifications as read.', 'error');
      router.refresh();
    }
  };

  const handleRowClick = (notification: NotificationResponseDto) => {
    void handleMarkRead(notification.id);
    if (notification.linkUrl) {
      router.push(getTargetUrl(notification.linkUrl));
    }
  };

  return (
    <div
      className="flex flex-col gap-6 flex-1 min-h-0 p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      <div className="flex flex-col gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary md:text-3xl">Notifications</h1>
            {unreadCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{unreadCount} new</span>}
          </div>
          <p className="mt-1 text-xs text-text-muted">Clinic alerts, inquiries, and communication updates.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search notifications..." className="h-9 bg-card pl-9 text-sm" />
          </div>
          <select
            value={activeTab}
            onChange={(event) => setActiveTab(event.target.value as TabType)}
            className="h-9 min-w-32 cursor-pointer rounded-xl border border-card-border/60 bg-card px-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {TABS.map((tab) => (
              <option key={tab} value={tab}>{tab.charAt(0) + tab.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as 'ALL' | 'INQUIRY' | 'EMAIL' | 'CHAT')}
            className="h-9 min-w-32 cursor-pointer rounded-xl border border-card-border/60 bg-card px-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="ALL">All types</option>
            <option value="INQUIRY">Inquiry</option>
            <option value="EMAIL">Email</option>
            <option value="CHAT">Chat</option>
          </select>
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button variant="outline" size="sm" onClick={() => router.refresh()} className="h-9 gap-1.5 text-xs" title="Refresh notifications">
              <RefreshCw className="size-3.5" /> Refresh
            </Button>
            <Button size="sm" onClick={() => void handleMarkAllRead()} disabled={!unreadCount} className="h-9 gap-1.5 text-xs bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background">
              <CheckCheck className="size-3.5" /> Mark all read
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 min-h-0">
        <div className="hidden border-b border-card-border/40 py-2 pr-4 text-sm font-bold text-foreground md:block">
          Notification
        </div>

        {loading && notifications.length === 0 ? (
          <SecretaryListSkeletonTheme>
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-card-border/40 pr-4 py-3.5">
                <SecretaryListSkeleton circle width={36} height={36} />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <SecretaryListSkeleton width={160} height={14} />
                  <SecretaryListSkeleton width={240} height={12} />
                </div>
                <SecretaryListSkeleton width={48} height={12} />
              </div>
            ))}
          </SecretaryListSkeletonTheme>
        ) : error && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted/30"><CircleAlert className="size-5 text-muted-foreground/60" /></div>
            <p className="text-sm font-medium text-foreground">Could not load notifications</p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void fetchNotifications('reset')} className="mt-3 h-8 text-xs">Retry</Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted/30"><Bell className="size-5 text-muted-foreground/60" /></div>
            <p className="text-sm font-medium text-foreground">No notifications found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting the search or status filter.</p>
          </div>
        ) : (
          <>
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRowClick(notification)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleRowClick(notification);
                    }
                  }}
                  className={`grid cursor-pointer gap-3 border-b border-card-border/40 pr-4 py-3.5 transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4 ${!notification.isRead ? 'bg-primary/[0.025]' : ''} group`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/30">{getNotificationIcon(notification.type)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><p className={`truncate text-sm ${notification.isRead ? 'font-medium text-foreground' : 'font-bold text-foreground'}`}>{notification.title}</p>{!notification.isRead && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}</div>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="shrink-0 text-sm text-muted-foreground font-mono group-hover:hidden md:text-right" suppressHydrationWarning>{formatRelativeTime(notification.createdAt)}</span>
                    {notification.linkUrl && (
                      <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); void handleMarkRead(notification.id); router.push(getTargetUrl(notification.linkUrl)); }} disabled={updatingId === notification.id} className="h-7 gap-1 px-2 text-sm text-muted-foreground hidden group-hover:inline-flex hover:text-foreground">
                        <ExternalLink className="size-4" /> Open
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {(prevPageCount > 0 || hasMore) && (
              <div className="flex items-center justify-between pt-3 pb-4 mb-2 border-t border-card-border/40 shrink-0">
                <span className="text-sm text-muted-foreground">
                  Page {prevPageCount + 1} of {Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE))} · Showing {notifications.length} of {total}
                </span>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchNotifications('prev')}
                    disabled={prevPageCount === 0 || loading}
                    className="h-8 px-2.5 text-sm gap-1 text-muted-foreground hover:text-foreground"
                    title="Newer notifications"
                  >
                    <ChevronLeft className="size-4" /> Newer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchNotifications('next')}
                    disabled={!hasMore || loading}
                    className="h-8 px-2.5 text-sm gap-1 text-muted-foreground hover:text-foreground"
                    title="Older notifications"
                  >
                    Older <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
