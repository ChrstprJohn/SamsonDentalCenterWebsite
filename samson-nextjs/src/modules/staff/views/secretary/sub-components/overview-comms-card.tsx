import React from 'react';
import Link from 'next/link';
import { MessageSquare, Bell, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface OverviewCommsCardProps {
  chatUnread: number;
  notifUnread: number;
}

export function OverviewCommsCard({ chatUnread, notifUnread }: OverviewCommsCardProps) {
  return (
    <Card className="border-card-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-0">
        <CardTitle className="text-sm font-bold text-text-primary">Inbox</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-5 pt-4 pb-5">
        <Link
          href="/secretary-v2/chat"
          className="flex items-center justify-between p-3 border border-card-border/40 rounded-xl hover:bg-secondary-bg/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <MessageSquare className="size-4 text-primary-start" /> Chat
          </span>
          <span className="flex items-center gap-1">
            {chatUnread > 0 && (
              <span className="rounded-full bg-primary-start/10 px-2 py-0.5 text-[10px] font-bold text-primary-start">
                {chatUnread} unread
              </span>
            )}
            <ChevronRight className="size-3 text-text-muted" />
          </span>
        </Link>

        <Link
          href="/secretary-v2/notifications"
          className="flex items-center justify-between p-3 border border-card-border/40 rounded-xl hover:bg-secondary-bg/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Bell className="size-4 text-primary-start" /> Notifications
          </span>
          <span className="flex items-center gap-1">
            {notifUnread > 0 && (
              <span className="rounded-full bg-primary-start/10 px-2 py-0.5 text-[10px] font-bold text-primary-start">
                {notifUnread} new
              </span>
            )}
            <ChevronRight className="size-3 text-text-muted" />
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}