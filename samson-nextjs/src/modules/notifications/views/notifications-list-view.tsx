'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { NotificationResponseDto } from '../dtos/management/notification-response.dto';
import { markAllReadAction } from '../actions/management/mark-all-read.action';
import { markReadAction } from '../actions/management/mark-read.action';
import { useToast } from '@/components/feedback/toast-container';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Bell,
  Search,
  Check,
  CheckCheck,
  ArrowLeft,
  ExternalLink,
  Calendar,
  AlertTriangle,
  FileText,
  MailWarning,
  CircleAlert,
  Clock,
} from 'lucide-react';

interface NotificationsListViewProps {
  initialNotifications: NotificationResponseDto[];
}

const TABS = ['ALL', 'UNREAD', 'READ'] as const;
type TabType = (typeof TABS)[number];

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_APPOINTMENT_REQUEST':
    case 'NEW_RESCHEDULE_REQUEST':
      return <Calendar className="size-4 text-emerald-500" />;
    case 'PATIENT_CANCEL_ALERT':
      return <AlertTriangle className="size-4 text-rose-500" />;
    case 'TREATMENT_RENDERED':
      return <FileText className="size-4 text-blue-500" />;
    case 'FAILED_EMAIL_ALERT':
      return <MailWarning className="size-4 text-amber-500" />;
    default:
      return <CircleAlert className="size-4 text-primary" />;
  }
}

function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  } catch {
    return '';
  }
}

export function NotificationsListView({ initialNotifications }: NotificationsListViewProps) {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(initialNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialNotifications.length > 0 ? initialNotifications[0].id : null
  );
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const { addToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const isV2 = pathname?.startsWith('/secretary-v2');

  const getTargetUrl = (url?: string | null) => {
    if (!url) return '#';
    if (isV2 && url.startsWith('/secretary') && !url.startsWith('/secretary-v2')) {
      return url.replace(/^\/secretary(\/|$)/, '/secretary-v2$1');
    }
    return url;
  };

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
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
    } else {
      addToast('All notifications marked as read', 'success');
    }
  };

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return notifications.filter((notif) => {
      const matchesSearch =
        notif.title.toLowerCase().includes(normalizedSearch) ||
        notif.message.toLowerCase().includes(normalizedSearch);

      const matchesTab =
        activeTab === 'ALL' ||
        (activeTab === 'UNREAD' && !notif.isRead) ||
        (activeTab === 'READ' && notif.isRead);

      return matchesSearch && matchesTab;
    });
  }, [notifications, searchTerm, activeTab]);

  const selectedNotif = useMemo(
    () => notifications.find((n) => n.id === selectedId) ?? null,
    [notifications, selectedId]
  );

  const handleSelectCard = (id: string) => {
    setSelectedId(id);
    setMobileView('detail');
    const notif = notifications.find((n) => n.id === id);
    if (notif && !notif.isRead) {
      handleMarkRead(id);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex h-full w-full overflow-hidden">
        {/* -- Left Sidebar: Card List -- */}
        <Sidebar
          collapsible="none"
          className={`flex-col lg:w-[350px] flex-1 lg:flex-none border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${
            mobileView === 'list' ? 'flex' : 'hidden'
          } lg:flex`}
        >
          {/* Header */}
          <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
            <div className="flex w-full h-8 items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
                <div className="text-base font-medium text-foreground">
                  Notifications Log
                </div>
                {unreadCount > 0 && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-primary">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="px-1">
              <SidebarInput
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-md"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
              {TABS.map((tab) => (
                <Button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  variant="ghost"
                  size="sm"
                  className={`flex-1 h-8 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </SidebarHeader>

          {/* Card List */}
          <SidebarContent
            data-lenis-prevent
            style={{ scrollbarWidth: 'thin' }}
            className="!overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          >
            <SidebarGroup className="px-0">
              <SidebarGroupContent className="flex flex-col">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
                      <Bell className="size-5 text-muted-foreground/60" />
                    </div>
                    <span className="text-xs font-medium text-foreground">No notifications found</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {activeTab === 'UNREAD' ? 'You have no unread notifications.' : 'Try adjusting your search.'}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const isSelected = selectedId === notif.id;

                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleSelectCard(notif.id)}
                        className={`flex items-start w-full gap-3 border-b p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                          isSelected
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : notif.isRead
                            ? 'text-muted-foreground opacity-80'
                            : 'text-foreground font-medium'
                        }`}
                      >
                        <div className="size-9 shrink-0 rounded-full bg-muted-foreground/10 border border-border/60 flex items-center justify-center overflow-hidden">
                          {getNotificationIcon(notif.type)}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1 gap-1">
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className={`text-[13px] truncate ${!notif.isRead ? 'font-bold text-foreground' : 'font-medium'}`}>
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap shrink-0">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notif.message}
                          </span>
                          {!notif.isRead && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="size-2 rounded-full bg-primary animate-pulse" />
                              <span className="text-[10px] font-semibold text-primary">Unread</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* -- Right Panel: Detail View -- */}
        {selectedNotif ? (
          <div
            className={`flex-1 flex-col bg-muted/10 h-full overflow-hidden ${
              mobileView === 'detail' ? 'flex' : 'hidden'
            } lg:flex`}
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-sidebar">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileView('list')}
                  className="lg:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-medium text-foreground truncate">Notification Details</span>
                  <span className="text-[11px] text-muted-foreground truncate">{selectedNotif.title}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedNotif.isRead ? 'default' : 'warning'}>
                  {selectedNotif.isRead ? 'Read' : 'Unread'}
                </Badge>
                {!selectedNotif.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleMarkRead(selectedNotif.id, e)}
                    className="h-7 text-xs gap-1"
                  >
                    <Check className="size-3.5 text-emerald-500" />
                    Mark Read
                  </Button>
                )}
              </div>
            </div>

            {/* Panel Body */}
            <div
              className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
              style={{ scrollbarWidth: 'thin' }}
              data-lenis-prevent
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-card-border rounded-xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Notification Type</span>
                  <span className="text-sm font-semibold text-text-primary">{selectedNotif.type}</span>
                </div>
                <div className="bg-card border border-card-border rounded-xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Received</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {new Date(selectedNotif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-secondary">Notification Message</span>
                <div className="bg-card border border-card-border rounded-xl p-4 text-sm text-foreground leading-relaxed">
                  {selectedNotif.message}
                </div>
              </div>

              {selectedNotif.linkUrl && (
                <div className="pt-2">
                  <Button asChild className="w-full gap-2 text-sm font-semibold">
                    <Link href={getTargetUrl(selectedNotif.linkUrl)}>
                      <ExternalLink className="size-4" />
                      Open Linked Item / Action
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 p-6 text-center hidden lg:flex">
            <div className="size-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
              <Bell className="size-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">No Notification Selected</p>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Select a notification from the list to view its full details and navigate to its related resource.
            </p>
          </div>
        )}
      </div>
  );
}
