'use client';

import React, { useTransition } from 'react';
import { Trash2, CalendarX2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast-container';
import { formatShortDate, formatTimeAgo } from '@/shared/utils/date.util';
import { deleteNoShowReasonAction } from '../actions/delete-no-show-reason.action';
import type { NoShowReasonListItem } from '../queries/get-no-show-reasons.query';

export function NoShowReasonsAdminView({ initialReasons }: { initialReasons: NoShowReasonListItem[] }) {
  const [reasons, setReasons] = React.useState(initialReasons);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const router = useRouter();

  const PAGE_SIZE = 25;
  const [pageIndex, setPageIndex] = React.useState(0);
  const totalPages = Math.max(1, Math.ceil(reasons.length / PAGE_SIZE));
  const pageItems = reasons.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteNoShowReasonAction(id);
      if (!result.success) {
        addToast(result.error, 'error');
        return;
      }
      setReasons((current) => {
        const next = current.filter((r) => r.id !== id);
        setPageIndex((cur) => Math.min(cur, Math.max(0, Math.ceil(next.length / PAGE_SIZE) - 1)));
        return next;
      });
      addToast('Reason deleted.', 'success');
    });
  };

  if (reasons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted/30">
          <CalendarX2 className="size-5 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-foreground">No no-show reasons yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Patient reasons will appear here once submitted via the no-show link.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {pageItems.map((item) => (
        <div
          key={item.id}
          className="group grid gap-3 border-b border-card-border/40 py-3.5 pr-4 transition-colors hover:bg-muted/20 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/30">
              <CalendarX2 className="size-4 text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{item.patientName}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {[item.serviceName, item.appointmentDate ? `Appointment: ${formatShortDate(item.appointmentDate)}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span className="shrink-0 font-mono text-sm text-muted-foreground group-hover:hidden md:text-right" suppressHydrationWarning>
              {formatTimeAgo(item.createdAt)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/secretary-v2/appointments?appointmentId=${item.appointmentId}`)}
              className="hidden h-7 gap-1 px-2 text-sm text-muted-foreground hover:text-foreground group-hover:inline-flex"
              title="Appointment Detail"
            >
              <ExternalLink className="size-4" /> Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleDelete(item.id)}
              className="hidden h-7 w-7 p-0 text-muted-foreground hover:text-red-500 group-hover:inline-flex"
              aria-label="Delete reason"
              title="Delete reason"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 pb-4 mb-2 border-t border-card-border/40 shrink-0">
          <span className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {totalPages} · Showing {pageItems.length} of {reasons.length}
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((p) => p - 1)}
              disabled={pageIndex === 0}
              className="h-8 px-2.5 text-sm gap-1 text-muted-foreground hover:text-foreground"
              title="Newer reasons"
            >
              <ChevronLeft className="size-4" /> Newer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((p) => p + 1)}
              disabled={pageIndex >= totalPages - 1}
              className="h-8 px-2.5 text-sm gap-1 text-muted-foreground hover:text-foreground"
              title="Older reasons"
            >
              Older <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}